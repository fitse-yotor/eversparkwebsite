import { NextResponse } from "next/server"
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    console.log("=== Test Email API Called ===")
    
    const body = await request.json()
    const { to } = body

    console.log("Request body:", body)

    if (!to) {
      return NextResponse.json(
        { message: "Email address is required" },
        { status: 400 }
      )
    }

    // Check if SMTP password is configured
    if (!process.env.SMTP_PASSWORD) {
      console.error("SMTP_PASSWORD not configured")
      return NextResponse.json(
        { 
          success: false,
          message: "SMTP password not configured. Please add SMTP_PASSWORD to your .env.local file.",
          error: "MISSING_SMTP_PASSWORD"
        },
        { status: 500 }
      )
    }

    console.log("SMTP Configuration:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASSWORD
    })

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.eversparket.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'account@eversparket.com',
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    console.log("Verifying SMTP connection...")
    await transporter.verify()
    console.log("SMTP connection verified successfully")

    console.log("Sending test email to:", to)

    // Send test email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #003300; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0;">Ever Spark Technologies</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
          <h2 style="color: #003300; margin-top: 0;">Test Email - SMTP Configuration</h2>
          
          <p>Hello,</p>
          
          <p>This is a test email to verify that the SMTP email configuration is working correctly.</p>
          
          <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>✓ Email Server Details:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>SMTP Host: mail.eversparket.com</li>
              <li>SMTP Port: 465 (SSL)</li>
              <li>From: account@eversparket.com</li>
            </ul>
          </div>
          
          <p>If you received this email, it means the email configuration is working properly!</p>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>📧 Email Features:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>HR User Onboarding Notifications</li>
              <li>Password Reset Links</li>
              <li>System Notifications</li>
              <li>Leave Request Alerts</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <strong>Test Information:</strong><br>
            Sent: ${new Date().toLocaleString()}<br>
            To: ${to}<br>
            System: Ever Spark HR Management System
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Ever Spark Technologies. All rights reserved.</p>
          <p>This is an automated test email. Please do not reply.</p>
        </div>
      </div>
    `

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Ever Spark Technologies <account@eversparket.com>',
      to,
      subject: "Test Email - Ever Spark SMTP Configuration",
      html: emailHtml
    })

    console.log("Email sent successfully:", info.messageId)

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${to}. Please check your inbox.`,
      messageId: info.messageId
    })
  } catch (error) {
    console.error("Error in test email API:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error details:", errorMessage)
    
    return NextResponse.json(
      { 
        success: false,
        message: `Failed to send test email: ${errorMessage}`,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Test Email API - Use POST method with { to: 'email@example.com' }",
    example: {
      method: "POST",
      body: {
        to: "fitseyotor@gmail.com"
      }
    },
    config: {
      host: process.env.SMTP_HOST || 'mail.eversparket.com',
      port: process.env.SMTP_PORT || '465',
      user: process.env.SMTP_USER || 'account@eversparket.com',
      hasPassword: !!process.env.SMTP_PASSWORD
    }
  })
}
