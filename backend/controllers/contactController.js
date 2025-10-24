const transporter = require('../config/email');

// Simple contact form email sender
const sendContactEmail = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    console.log('📧 Contact form submission received:', { 
      firstName, 
      lastName, 
      email, 
      subject 
    });

    // Simple validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email content for admin (your email)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'mokamahesh77@gmail.com', // Your email
      subject: `FarmToKitchen Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🌱 FarmToKitchen Contact Form</h1>
            <p style="margin: 5px 0 0 0;">New message from website</p>
          </div>
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px;">
            <div style="margin-bottom: 15px;">
              <strong style="color: #059669;">Name:</strong>
              <span>${firstName} ${lastName}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #059669;">Email:</strong>
              <span>${email}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #059669;">Subject:</strong>
              <span>${subject}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #059669;">Message:</strong>
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #10B981; margin-top: 5px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <small style="color: #6b7280;">Submitted on: ${new Date().toLocaleString()}</small>
            </div>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('✅ Contact email sent successfully');

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};

module.exports = {
  sendContactEmail
};