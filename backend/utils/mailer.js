const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

async function sendMail({ to, subject, text, html }) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not set in environment variables.');
  }

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'Local Helper', email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html || `<p>${text}</p>`,
      textContent: text || undefined
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${errBody}`);
  }

  return response.json();
}

module.exports = { sendMail };