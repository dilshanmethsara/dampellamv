// Example: Send OTP to user's phone
const axios = require('axios');

async function sendOTP() {
    try {
        const response = await axios.post('https://dampellamv.vercel.app/api/send-whatsapp', {
            type: 'otp',
            data: {
                phoneNumber: '0771234567', // User's phone number
                code: '123456' // OTP code
            },
            sessionId: 'ws_h34gj4pl'
        });

        console.log('OTP Response:', response.data);
    } catch (error) {
        console.error('Error sending OTP:', error.response?.data || error.message);
    }
}

sendOTP();
