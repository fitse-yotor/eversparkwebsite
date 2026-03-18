import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    console.log('Attempting to send email to:', to)
    console.log('SMTP Configuration:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASSWORD
    })

    // Create transporter with your email server configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.eversparket.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'account@eversparket.com',
        pass: process.env.SMTP_PASSWORD || '',
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      }
    })

    // Verify connection configuration
    console.log('Verifying SMTP connection...')
    await transporter.verify()
    console.log('SMTP server connection verified successfully')

    // Send email
    const info = await transporter.sendMail({
      from: from || process.env.SMTP_FROM || 'Ever Spark Technologies <account@eversparket.com>',
      to,
      subject,
      html,
    })

    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
