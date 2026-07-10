const nodemailer = require('nodemailer');

// --- Single shared Nodemailer transporter for the whole backend ---
//
// IMPORTANT: Render's free-tier outbound networking has broken/unreachable
// IPv6 routing to Google's SMTP servers. When Node resolves smtp.gmail.com
// it can get back an IPv6 (AAAA) address, and the connection then fails with
// "connect ENETUNREACH ...:465". Forcing `family: 4` makes Nodemailer only
// ever connect over IPv4, which Render's egress actually supports.
//
// Also: `service: 'gmail'` (used previously) silently OVERRIDES whatever
// host/port/secure you set, which is why logs showed port 465 even though
// the code said port 587. We set host/port/secure explicitly instead.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for port 465 (SSL), false for port 587 (STARTTLS)
  family: 4,    // force IPv4 - fixes ENETUNREACH on Render
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // 16-character Google App Password (no spaces)
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;