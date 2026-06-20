// Simple OTP sender endpoint for test-otp page
// Uses WireWeb if WIREWEB_API_KEY and WIREWEB_SESSION_ID are set, otherwise falls back to DMV working server.

const axios = require('axios');

const WHATSAPP_FALLBACK_URL = 'https://dmvwhaserver.vercel.app/send-message';
const WIREWEB_API_URL = 'https://app.wireweb.co.in/api/v1/messages';

const otpStore = new Map(); // In-memory OTP store (use Redis/DB in production)

function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) otp += digits[Math.floor(Math.random() * 10)];
  return otp;
}

function formatSriLankaNumber(phone) {
  let n = (phone || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = '94' + n.substring(1);
  if (!n.startsWith('94')) n = '94' + n;
  return n;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  try {
    const { phoneNumber, studentName } = req.body || {};
    if (!phoneNumber) return res.status(400).json({ success: false, error: 'MISSING_PHONE_NUMBER' });

    const formatted = formatSriLankaNumber(phoneNumber);
    const otp = generateOTP(6);
    const message = studentName
      ? `🔐 *Dampella LMS - Student Registration*\n\nDear ${studentName},\n\nYour verification code is: *${otp}*\n\nThis code will expire in 5 minutes.\n\nDo not share this code with anyone.`
      : `🔐 *Dampella LMS - Student Registration*\n\nYour verification code is: *${otp}*\n\nThis code will expire in 5 minutes.\n\nDo not share this code with anyone.`;

    // Store OTP
    const key = `signup_${formatted}`;
    const otpData = { phoneNumber: formatted, code: otp, createdAt: Date.now(), expiresAt: Date.now() + 5 * 60 * 1000 };
    otpStore.set(key, otpData);

    // Prefer WireWeb if credentials are present
    const wireKey = process.env.WIREWEB_API_KEY || process.env.NEXT_PUBLIC_WIREWEB_API_KEY;
    const wireSession = process.env.WIREWEB_SESSION_ID || process.env.NEXT_PUBLIC_WIREWEB_SESSION_ID;

    if (wireKey && wireSession) {
      // Send via WireWeb
      try {
        const whatsappJID = `${formatted}@s.whatsapp.net`;
        const resp = await axios.post(WIREWEB_API_URL, {
          sessionId: wireSession,
          to: whatsappJID,
          text: message
        }, {
          headers: { Authorization: `Bearer ${wireKey}`, 'Content-Type': 'application/json' }
        });

        return res.json({ success: true, message: 'OTP sent via WireWeb', data: { messageId: resp.data?.messageId || resp.data }, ...(process.env.NODE_ENV === 'development' ? { otp } : {}) });
      } catch (err) {
        console.error('WireWeb send error:', err.response?.data || err.message);
        // fallthrough to fallback
      }
    }

    // Fallback to working DMV server
    try {
      const resp = await axios.post(WHATSAPP_FALLBACK_URL, { to: formatted, text: message });
      return res.json({ success: true, message: 'OTP sent via fallback WhatsApp server', data: resp.data, ...(process.env.NODE_ENV === 'development' ? { otp } : {}) });
    } catch (err) {
      console.error('Fallback send error:', err.response?.data || err.message);
      return res.status(500).json({ success: false, error: err.response?.data || err.message, message: 'Failed to send OTP via WireWeb and fallback server' });
    }

  } catch (error) {
    console.error('send-otp API error:', error);
    return res.status(500).json({ success: false, error: error.message || error, message: 'Internal server error' });
  }
};
