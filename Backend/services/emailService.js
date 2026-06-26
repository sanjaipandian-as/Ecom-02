import nodemailer from 'nodemailer';

// Create a lazy Nodemailer transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Sends a registration verification OTP email.
 *
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} otp - 6-digit OTP code
 */
export async function sendVerificationEmail(email, name, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Plenora" <sanjaiapandian@gmail.com>',
    to: email,
    subject: 'Verify Your Plenora Account',
    html: `
      <div style="font-family: 'Outfit', 'Inter', system-ui, sans-serif; background-color: #fafafa; padding: 40px; margin: 0; min-height: 100%; color: #1e1e1e;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.03); border: 1px solid #f0f0f0;">
          
          <!-- Header (Brand Gradient) -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">PLENORA</h1>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px; text-align: center;">
            <h2 style="font-size: 20px; color: #0f172a; margin-top: 0; margin-bottom: 8px; font-weight: 600;">Welcome, ${name}!</h2>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
              Thank you for signing up for Plenora. To complete your registration and secure your account, please verify your email address using the code below:
            </p>

            <!-- OTP Box -->
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; display: inline-block; margin-bottom: 32px;">
              <span style="font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: 6px; padding-left: 6px;">${otp}</span>
            </div>

            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
              This code will expire in 15 minutes.<br>
              If you did not request this email, you can safely ignore it.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.4;">
              &copy; 2026 Plenora Inc. All rights reserved.<br>
              Premium Skincare & Lifestyle Products.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  const client = getTransporter();
  await client.sendMail(mailOptions);
}

/**
 * Sends a password reset OTP email.
 *
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} otp - 6-digit OTP code
 */
export async function sendPasswordResetEmail(email, name, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Plenora" <sanjaiapandian@gmail.com>',
    to: email,
    subject: 'Reset Your Plenora Password',
    html: `
      <div style="font-family: 'Outfit', 'Inter', system-ui, sans-serif; background-color: #fafafa; padding: 40px; margin: 0; min-height: 100%; color: #1e1e1e;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.03); border: 1px solid #f0f0f0;">
          
          <!-- Header (Brand Gradient Red/Dark for Security) -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">PLENORA</h1>
          </div>

          <!-- Body -->
          <div style="padding: 40px 32px; text-align: center;">
            <h2 style="font-size: 20px; color: #0f172a; margin-top: 0; margin-bottom: 8px; font-weight: 600;">Password Reset Request</h2>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
              Hello ${name}, we received a request to reset the password for your Plenora account. Use the verification OTP code below to set your new password:
            </p>

            <!-- OTP Box -->
            <div style="background-color: #fff1f2; border: 1px dashed #fecdd3; border-radius: 12px; padding: 20px; display: inline-block; margin-bottom: 32px;">
              <span style="font-size: 32px; font-weight: 800; color: #be123c; letter-spacing: 6px; padding-left: 6px;">${otp}</span>
            </div>

            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
              This code is valid for 15 minutes.<br>
              <strong>If you did not request this:</strong> Someone might have entered your email by mistake. Your account remains completely secure, and you can ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.4;">
              &copy; 2026 Plenora Inc. All rights reserved.<br>
              Premium Skincare & Lifestyle Products.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  const client = getTransporter();
  await client.sendMail(mailOptions);
}
