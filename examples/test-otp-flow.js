// Test complete OTP flow: Store and Verify
const axios = require('axios');

async function testOTPFlow() {
    const phoneNumber = '0771234567';
    const testCode = '123456';

    try {
        // Step 1: Store OTP
        console.log('Step 1: Storing OTP...');
        const storeResponse = await axios.post('https://dampellamv.vercel.app/api/verify-otp', {
            action: 'store',
            phoneNumber: phoneNumber,
            code: testCode
        });
        
        console.log('Store Response:', storeResponse.data);

        // Step 2: Verify OTP
        console.log('\nStep 2: Verifying OTP...');
        const verifyResponse = await axios.post('https://dampellamv.vercel.app/api/verify-otp', {
            action: 'verify',
            phoneNumber: phoneNumber,
            code: testCode
        });
        
        console.log('Verify Response:', verifyResponse.data);

        // Step 3: Send OTP via WhatsApp
        console.log('\nStep 3: Sending OTP via WhatsApp...');
        const whatsappResponse = await axios.post('https://dampellamv.vercel.app/api/send-whatsapp', {
            type: 'otp',
            data: {
                phoneNumber: phoneNumber,
                code: testCode
            },
            sessionId: 'ws_h34gj4pl'
        });
        
        console.log('WhatsApp Response:', whatsappResponse.data);

    } catch (error) {
        console.error('Error in OTP flow test:', error.response?.data || error.message);
    }
}

testOTPFlow();
