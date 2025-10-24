const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email transporter error:', error.message);
    console.log('⚠️  Email functionality will be limited');
  } else {
    console.log('✅ Email transporter is ready');
  }
});

// Export just the transporter directly
module.exports = transporter;