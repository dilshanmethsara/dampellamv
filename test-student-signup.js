// Test Student Signup with WhatsApp OTP
const axios = require('axios');

async function testStudentSignup() {
    console.log('🧪 Testing Student Signup with WhatsApp OTP...');
    
    const testPhoneNumber = '0771234567';
    const testStudentName = 'Test Student';
    
    try {
        // Step 1: Send OTP
        console.log('\n📱 Step 1: Sending OTP for student signup...');
        const sendOTPResponse = await axios.post('https://dampellamv.vercel.app/api/student-signup', {
            action: 'send_otp',
            phoneNumber: testPhoneNumber,
            studentName: testStudentName
        });
        
        console.log('✅ Send OTP Response:', sendOTPResponse.data);
        
        if (sendOTPResponse.data.success) {
            const otpCode = sendOTPResponse.data.data.otp; // Available in development
            console.log(`📋 Development OTP: ${otpCode}`);
            
            // Step 2: Verify OTP
            console.log('\n🔐 Step 2: Verifying OTP...');
            const verifyOTPResponse = await axios.post('https://dampellamv.vercel.app/api/student-signup', {
                action: 'verify_otp',
                phoneNumber: testPhoneNumber,
                otp: otpCode,
                otpData: sendOTPResponse.data.otpData
            });
            
            console.log('✅ Verify OTP Response:', verifyOTPResponse.data);
            
            if (verifyOTPResponse.data.success) {
                console.log('🎉 Student signup OTP verification successful!');
            } else {
                console.log('❌ OTP verification failed:', verifyOTPResponse.data.message);
            }
            
        } else {
            console.log('❌ Failed to send OTP:', sendOTPResponse.data.message);
        }
        
    } catch (error) {
        console.error('❌ Test Error:', error.response?.data || error.message);
    }
}

// Test Resend OTP
async function testResendOTP() {
    console.log('\n🔄 Testing Resend OTP...');
    
    const testPhoneNumber = '0771234567';
    const testStudentName = 'Test Student';
    
    try {
        const resendResponse = await axios.post('https://dampellamv.vercel.app/api/student-signup', {
            action: 'resend_otp',
            phoneNumber: testPhoneNumber,
            studentName: testStudentName
        });
        
        console.log('✅ Resend OTP Response:', resendResponse.data);
        
    } catch (error) {
        console.error('❌ Resend OTP Error:', error.response?.data || error.message);
    }
}

// Run tests
async function runAllTests() {
    await testStudentSignup();
    await testResendOTP();
}

runAllTests();
