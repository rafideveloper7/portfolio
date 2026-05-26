// backend/src/routes/contact.routes.js
const router = require('express').Router();
const nodemailer = require('nodemailer');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send contact message (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Save to database first (always)
    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();

    // Try to send email — don't fail the request if email fails
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact Message: ${subject}`,
        html: `
          <h3>New message from ${name}</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      };
      await transporter.sendMail(mailOptions);

      const autoReply = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank you for contacting Rafi Ullah',
        html: `
          <h3>Hi ${name},</h3>
          <p>Thank you for reaching out! I've received your message and will get back to you within 24-48 hours.</p>
          <p>Best regards,<br>Rafi Ullah<br>Full Stack Developer</p>
        `
      };
      await transporter.sendMail(autoReply);
    } catch (emailError) {
      // Log but don't fail — message is already saved to DB
      console.warn('Email sending failed (message still saved):', emailError.message);
    }

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get all messages (admin)
router.get('/messages', auth, async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

// Mark message as read (admin)
router.put('/messages/:id/read', auth, async (req, res) => {
  const message = await Message.findById(req.params.id);
  message.read = true;
  await message.save();
  res.json(message);
});

// Delete message (admin)
router.delete('/messages/:id', auth, async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
