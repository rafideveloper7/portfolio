// backend/src/routes/contact.routes.js
const router = require('express').Router();
const nodemailer = require('nodemailer');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || EMAIL_USER;

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });
}

async function sendDirectEmail(to, subject, html) {
  const res = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(to), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: to, subject, name: 'RafiOS Portfolio', message: html })
  });
  const data = await res.json();
  if (data.message === 'error') throw new Error(data.message || 'FormSubmit error');
}

async function sendMail(mailOptions) {
  try {
    if (transporter) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('No SMTP configured, using FormSubmit fallback');
      await sendDirectEmail(mailOptions.to, mailOptions.subject, mailOptions.html);
    }
  } catch (e) {
    console.warn('SMTP failed, trying FormSubmit:', e.message);
    await sendDirectEmail(mailOptions.to, mailOptions.subject, mailOptions.html);
  }
}

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f172a;color:#e2e8f0;border-radius:16px;">
        <h2 style="color:#60a5fa;margin-bottom:16px;">New Contact Message</h2>
        <table style="width:100%">
          <tr><td style="color:#94a3b8;font-size:13px;">From</td><td style="color:#f1f5f9;font-weight:600;">${name}</td></tr>
          <tr><td style="color:#94a3b8;font-size:13px;">Email</td><td style="color:#60a5fa;">${email}</td></tr>
          <tr><td style="color:#94a3b8;font-size:13px;">Subject</td><td style="color:#f1f5f9;">${subject}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#1e293b;border-radius:12px;border:1px solid #334155;">
          <p style="color:#cbd5e1;line-height:1.6;white-space:pre-wrap;">${message}</p>
        </div>
      </div>`;

    const autoReplyHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0f172a;color:#e2e8f0;border-radius:16px;">
        <h2 style="color:#60a5fa;margin-bottom:12px;">Hi ${name} 👋</h2>
        <p style="color:#cbd5e1;line-height:1.6;">Thank you for reaching out! I've received your message and will get back to you within 24–48 hours.</p>
        <p style="color:#94a3b8;margin-top:20px;">Best regards,<br><strong style="color:#f1f5f9;">Rafi Ullah</strong><br><span style="color:#60a5fa;">Full Stack Developer</span></p>
      </div>`;

    try {
      await sendMail({ from: EMAIL_USER, to: ADMIN_EMAIL, subject: `New Contact: ${subject}`, html: adminHtml });
      await sendMail({ from: EMAIL_USER, to: email, subject: 'Thank you for contacting Rafi Ullah', html: autoReplyHtml });
    } catch (emailError) {
      console.warn('Email sending failed (message still saved):', emailError.message);
    }

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/messages', auth, async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

router.put('/messages/:id/read', auth, async (req, res) => {
  const message = await Message.findById(req.params.id);
  message.read = true;
  await message.save();
  res.json(message);
});

router.delete('/messages/:id', auth, async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
