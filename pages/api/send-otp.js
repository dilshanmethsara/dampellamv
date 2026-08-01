import axios from 'axios';

function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) otp += digits[Math.floor(Math.random() * 10)];
  return otp;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { phoneNumber, studentName, text } = req.body;
  if (!phoneNumber) return res.status(400).json({ success: false, message: 'phoneNumber required' });

  try {
    // format number for Sri Lanka
    let formatted = phoneNumber.replace(/\D/g, '');
    if (formatted.startsWith('0')) formatted = '94' + formatted.substring(1);
    if (!formatted.startsWith('94')) formatted = '94' + formatted;
    const to = `${formatted}@s.whatsapp.net`;

    if (text) {
      // send provided text (confirmation or custom message)
      const resp = await axios.post('https://app.wireweb.co.in/api/v1/messages', {
        sessionId: process.env.WIREWEB_SESSION_ID,
        to,
        text
      }, {
        headers: {
          Authorization: `Bearer ${process.env.WIREWEB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return res.status(200).json({ success: true, sent: true, messageId: resp.data?.messageId || resp.data });
    }

    const otp = generateOTP(6);
    const otpText = studentName
      ? `🔐 Dampella LMS\nDear ${studentName}, your verification code is: *${otp}* (expires in 5 min).`
      : `🔐 Dampella LMS\nYour verification code is: *${otp}* (expires in 5 min).`;

    const resp = await axios.post('https://app.wireweb.co.in/api/v1/messages', {
      sessionId: process.env.WIREWEB_SESSION_ID,
      to,
      text: otpText
    }, {
      headers: {
        Authorization: `Bearer ${process.env.WIREWEB_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // return otp data (store server-side if you want persistence)
    return res.status(200).json({
      success: true,
      otp,
      sent: true,
      messageId: resp.data?.messageId || resp.data
    });
  } catch (err) {
    console.error('send-otp error', err.response?.data || err.message);
    return res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
}