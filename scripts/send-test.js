const axios = require('axios');
require('dotenv').config({ path: './.env.local' });

const WIREWEB_API_URL = 'https://app.wireweb.co.in/api/v1/messages';
const API_KEY = process.env.WIREWEB_API_KEY || process.env.NEXT_PUBLIC_WIREWEB_API_KEY;
const SESSION_ID = process.env.WIREWEB_SESSION_ID || process.env.NEXT_PUBLIC_WIREWEB_SESSION_ID;

function formatSriLanka(number) {
  let n = String(number).replace(/\D/g, '');
  if (n.startsWith('0')) n = '94' + n.slice(1);
  if (!n.startsWith('94')) n = '94' + n;
  return n + '@s.whatsapp.net';
}

async function sendTest(toRaw, text) {
  const to = formatSriLanka(toRaw);
  console.log('[send-test] sending to', to, 'text:', text);
  try {
    const resp = await axios.post(
      WIREWEB_API_URL,
      { sessionId: SESSION_ID, to, text },
      { headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' } }
    );
    console.log('[send-test] response:', JSON.stringify(resp.data, null, 2));
  } catch (err) {
    console.error('[send-test] error:', err.response?.data || err.message);
    process.exitCode = 1;
  }
}

const [,, toArg, ...textParts] = process.argv;
if (!toArg || textParts.length === 0) {
  console.error('Usage: node scripts/send-test.js <phone> "<message>"');
  process.exit(1);
}
sendTest(toArg, textParts.join(' '));
