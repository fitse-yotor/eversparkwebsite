import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    console.log("=== Resend Credentials API Called ===")

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
    const { employeeId } = body

    if (!employeeId) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      )
    }

    console.log("Resending credentials for employee:", employeeId)

    // Get employee details
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from("employees")
      .select("*")
      .eq("id", employeeId)
      .single()

    if (employeeError || !employee) {
      console.error("Employee not found:", employeeError)
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      )
    }

    // Generate new random password
    const generatePassword = () => {
      const length = 16
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
      let password = ""
      for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      return password
    }

    const newPassword = generatePassword()
    console.log("Generated new password for:", employee.email)

    // Update password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      employee.user_id,
      { password: newPassword }
    )

    if (updateError) {
      console.error("Failed to update password:", updateError)
      return NextResponse.json(
        { message: `Failed to update password: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log("Password updated successfully")

    // Send email with new credentials
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
          <h2 style="color: #003300;">Your Login Credentials - Ever Spark Technologies</h2>
          <p>Hello ${employee.first_name} ${employee.last_name},</p>
          <p>Your login credentials have been reset. Here are your new login details:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Employee ID:</strong> ${employee.employee_id}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${employee.email}</p>
            <p style="margin: 5px 0;"><strong>New Password:</strong> <code style="background-color: #fff; padding: 5px 10px; border-radius: 3px;">${newPassword}</code></p>
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
        to: employee.email,
        subject: "Your Login Credentials - Ever Spark Technologies",
        html: emailHtml
      })

      console.log("Email sent successfully to:", employee.email)
    } catch (emailError) {
      console.error("Email error:", emailError)
      return NextResponse.json({
        success: true,
        message: `Password reset but failed to send email. New password: ${newPassword}`,
        data: { temporary_password: newPassword }
      })
    }

    console.log("=== Resend Credentials Complete ===")
    return NextResponse.json({
      success: true,
      message: `New login credentials sent to ${employee.email}`,
      data: { email: employee.email }
    })

  } catch (error) {
    console.error("=== Resend Credentials Error ===")
    console.error("Error:", error)
    return NextResponse.json(
      { message: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
