import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("=== HR Onboard API Called ===")
    
    // Check if service role key is configured
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    console.log("Service role key exists:", !!serviceRoleKey)
    console.log("Supabase URL:", supabaseUrl)

    if (!serviceRoleKey || serviceRoleKey === "YOUR_SERVICE_ROLE_KEY_HERE" || !supabaseUrl) {
      console.error("Service role key not configured")
      return NextResponse.json(
        { 
          message: "Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file. See setup-service-key.md for instructions.",
          error: "MISSING_SERVICE_ROLE_KEY"
        },
        { status: 503 }
      )
    }

    // Create Supabase Admin client for user management
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const body = await request.json()
    const { email, first_name, last_name, role, send_invitation, check_only } = body

    console.log("Request body:", { email, first_name, last_name, role, send_invitation, check_only })

    // If this is just a check, return success
    if (check_only) {
      return NextResponse.json({ success: true, configured: true })
    }

    // Validate required fields
    if (!email || !first_name || !last_name || !role) {
      console.error("Missing required fields:", { email: !!email, first_name: !!first_name, last_name: !!last_name, role: !!role })
      return NextResponse.json(
        { message: "Missing required fields. Please provide email, first_name, last_name, and role." },
        { status: 400 }
      )
    }

    // Validate role
    if (!["admin", "super_admin"].includes(role)) {
      console.error("Invalid role:", role)
      return NextResponse.json(
        { message: `Invalid role: '${role}'. Must be 'admin' or 'super_admin'` },
        { status: 400 }
      )
    }

    console.log("Validation passed, checking for existing user...")

    // Check if user already exists
    const { data: existingUser, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error("Error listing users:", listError)
      return NextResponse.json(
        { message: `Failed to check existing users: ${listError.message}` },
        { status: 500 }
      )
    }

    const userExists = existingUser?.users?.some(u => u.email === email)

    if (userExists) {
      console.error("User already exists:", email)
      return NextResponse.json(
        { message: `User with email ${email} already exists. Please use a different email or delete the existing user first.` },
        { status: 400 }
      )
    }

    console.log("User does not exist, creating new user...")

    // Generate a random secure password
    const generatePassword = () => {
      const length = 16
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
      let password = ""
      for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      return password
    }

    const temporaryPassword = generatePassword()
    console.log("Generated temporary password")

    // Create auth user with Supabase Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: first_name,
        last_name: last_name,
        full_name: `${first_name} ${last_name}`,
        role: role
      }
    })

    if (authError || !authData.user) {
      console.error("Error creating auth user:", authError)
      return NextResponse.json(
        { message: `Failed to create user: ${authError?.message || "Unknown error"}` },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    // Update the profile that was automatically created by the trigger
    // The handle_new_user trigger creates a profile with role='user', so we need to update it
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: `${first_name} ${last_name}`,
        role: role
      })
      .eq("id", userId)

    if (profileError) {
      console.error("Error updating profile:", profileError)
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { message: `Failed to update profile: ${profileError.message}` },
        { status: 500 }
      )
    }

    // Create admin_users entry
    const { error: adminError } = await supabaseAdmin
      .from("admin_users")
      .insert({
        user_id: userId,
        permissions: {
          can_manage_users: role === "super_admin",
          can_manage_content: true,
          can_manage_settings: role === "super_admin"
        },
        is_active: true
      })

    if (adminError) {
      console.error("Error creating admin user:", adminError)
      // Rollback: delete profile and auth user
      await supabaseAdmin.from("profiles").delete().eq("id", userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { message: `Failed to create admin user: ${adminError.message}` },
        { status: 500 }
      )
    }

    console.log("Admin user created successfully")

    // Send email with credentials
    if (send_invitation) {
      try {
        const nodemailer = await import('nodemailer')
        
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST || 'mail.eversparket.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true,
          auth: {
            user: process.env.SMTP_USER || 'account@eversparket.com',
            pass: process.env.SMTP_PASSWORD || '',
          },
          tls: {
            rejectUnauthorized: false
          }
        })
        
        const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin`
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #003300;">Welcome to Ever Spark HR System</h2>
            <p>Hello ${first_name} ${last_name},</p>
            <p>Your HR admin account has been created. Here are your login credentials:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background-color: #fff; padding: 5px 10px; border-radius: 3px;">${temporaryPassword}</code></p>
              <p style="margin: 5px 0;"><strong>Role:</strong> ${role === 'super_admin' ? 'Super Admin' : 'HR Admin'}</p>
            </div>
            
            <p><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #003300;">${loginUrl}</a></p>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>⚠️ Important Security Notice:</strong></p>
              <p style="margin: 10px 0 0 0;">Please change your password immediately after your first login for security purposes.</p>
            </div>
            
            <p>If you have any questions or need assistance, please contact your system administrator.</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `

        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'Ever Spark Technologies <account@eversparket.com>',
          to: email,
          subject: "Your HR System Login Credentials",
          html: emailHtml
        })

        console.log("Credentials email sent successfully")
      } catch (emailError) {
        console.error("Error sending credentials email:", emailError)
        // Don't rollback, user is created, just log the error
        return NextResponse.json({
          success: true,
          message: `HR user created successfully, but failed to send credentials email. Please manually provide these credentials to ${email}:\n\nEmail: ${email}\nTemporary Password: ${temporaryPassword}\nLogin URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin`,
          data: {
            user_id: userId,
            email: email,
            role: role,
            temporary_password: temporaryPassword
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: send_invitation 
        ? `HR user created successfully. Login credentials have been sent to ${email}`
        : `HR user created successfully. Temporary password: ${temporaryPassword}`,
      data: {
        user_id: userId,
        email: email,
        role: role,
        ...(send_invitation ? {} : { temporary_password: temporaryPassword })
      }
    })

  } catch (error) {
    console.error("Error in HR onboarding:", error)
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
