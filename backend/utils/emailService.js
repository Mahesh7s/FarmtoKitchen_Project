const transporter = require('../config/email');

const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const mailOptions = {
      from: `"FarmToKitchen" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - FarmToKitchen',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FarmToKitchen</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password for your FarmToKitchen account. Click the button below to create a new password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>This link will expire in 1 hour for security reasons.</p>
              
              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <div class="footer">
                <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>&copy; 2024 FarmToKitchen. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to: ${email}`);
    return result;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendPasswordResetEmail
};