import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    console.log("=== Employee Onboard API Called ===")
    console.log("Service key exists:", !!serviceRoleKey)

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { message: "Service role key not configured" },
        { status: 503 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const body = await request.json()
    console.log("Request body received")
    
    const { employeeData, sendEmail = true } = body

    // Validate required fields
    if (!employeeData.email || !employeeData.first_name || !employeeData.last_name) {
      console.error("Missing required fields")
      return NextResponse.json(
        { message: "Missing required fields: email, first_name, last_name" },
        { status: 400 }
      )
    }

    console.log("Creating employee for:", employeeData.email)

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser?.users?.some(u => u.email === employeeData.email)

    if (userExists) {
      console.error("User already exists:", employeeData.email)
      return NextResponse.json(
        { message: `User with email ${employeeData.email} already exists` },
        { status: 400 }
      )
    }

    // Generate random password
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
    console.log("Generated password")

    // Create auth user
    console.log("Creating auth user...")
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: employeeData.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        full_name: `${employeeData.first_name} ${employeeData.last_name}`,
        role: "employee"
      }
    })

    if (authError || !authData.user) {
      console.error("Auth error:", authError)
      return NextResponse.json(
        { message: `Failed to create user: ${authError?.message}` },
        { status: 500 }
      )
    }

    const userId = authData.user.id
    console.log("Auth user created:", userId)

    // Update profile with employee role
    console.log("Updating profile...")
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: `${employeeData.first_name} ${employeeData.last_name}`,
        role: "employee"
      })
      .eq("id", userId)

    if (profileError) {
      console.error("Profile error:", profileError)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { message: `Failed to update profile: ${profileError.message}` },
        { status: 500 }
      )
    }

    console.log("Profile updated")

    // Prepare employee record - remove empty strings
    const employeeRecord: any = {
      user_id: userId,
      employee_id: employeeData.employee_id,
      first_name: employeeData.first_name,
      last_name: employeeData.last_name,
      email: employeeData.email,
      employment_type: employeeData.employment_type || "full_time",
      join_date: employeeData.join_date,
      status: "active",
      currency: employeeData.currency || "ETB"
    }

    // Add optional fields only if they have values
    if (employeeData.phone) employeeRecord.phone = employeeData.phone
    if (employeeData.department_id) employeeRecord.department_id = employeeData.department_id
    if (employeeData.position_id) employeeRecord.position_id = employeeData.position_id
    if (employeeData.manager_id) employeeRecord.manager_id = employeeData.manager_id
    if (employeeData.basic_salary) employeeRecord.basic_salary = employeeData.basic_salary

    console.log("Creating employee record...")
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from("employees")
      .insert(employeeRecord)
      .select()
      .single()

    if (employeeError) {
      console.error("Employee error:", employeeError)
      await supabaseAdmin.from("profiles").delete().eq("id", userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { message: `Failed to create employee: ${employeeError.message}` },
        { status: 500 }
      )
    }

    console.log("Employee created successfully")

    // Send email with credentials
    if (sendEmail) {
      try {
        console.log("Sending email...")
        const nodemailer = await import('nodemailer')
        
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST || 'mail.eversparket.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true,
          auth: {
            user: process.env.SMTP_USER || 'account@eversparket.com',
            pass: process.env.SMTP_PASSWORD || '',
          },
          tls: { rejectUnauthorized: false }
        })
        
        const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #003300;">Welcome to Ever Spark Technologies</h2>
            <p>Hello ${employeeData.first_name} ${employeeData.last_name},</p>
            <p>Welcome to the team! Your employee account has been created. Here are your login credentials:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Employee ID:</strong> ${employeeData.employee_id}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${employeeData.email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background-color: #fff; padding: 5px 10px; border-radius: 3px;">${temporaryPassword}</code></p>
            </div>
            
            <p><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #003300;">${loginUrl}</a></p>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>⚠️ Important Security Notice:</strong></p>
              <p style="margin: 10px 0 0 0;">Please change your password immediately after your first login for security purposes.</p>
            </div>
            
            <p>You can access your employee portal to:</p>
            <ul>
              <li>View your profile and employment details</li>
              <li>Request leave</li>
              <li>Access company documents</li>
              <li>Update your personal information</li>
            </ul>
            
            <p>If you have any questions, please contact HR.</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `

        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'Ever Spark Technologies <account@eversparket.com>',
          to: employeeData.email,
          subject: "Welcome to Ever Spark - Your Login Credentials",
          html: emailHtml
        })

        console.log("Email sent successfully")
      } catch (emailError) {
        console.error("Email error:", emailError)
        return NextResponse.json({
          success: true,
          message: `Employee created but failed to send email. Temporary password: ${temporaryPassword}`,
          data: { employee, temporary_password: temporaryPassword }
        })
      }
    }

    console.log("=== Employee Onboard Complete ===")
    return NextResponse.json({
      success: true,
      message: sendEmail 
        ? `Employee created successfully. Login credentials sent to ${employeeData.email}`
        : `Employee created successfully. Temporary password: ${temporaryPassword}`,
      data: { employee, ...(sendEmail ? {} : { temporary_password: temporaryPassword }) }
    })

  } catch (error) {
    console.error("=== Employee Onboard Error ===")
    console.error("Error:", error)
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
