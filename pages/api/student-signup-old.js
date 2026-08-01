// Student Signup OTP API for Dampella LMS
const axios = require('axios');

// Working WhatsApp API server
const WHATSAPP_API_URL = 'https://dmvwhaserver.vercel.app/send-message';

// Simple OTP storage (in production, use Redis or database)
const otpStore = new Map();

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        const { action, phoneNumber, studentName, otp, otpData } = req.body;

        switch (action) {
            case 'send_otp':
                // Send OTP for student signup
                const otpResult = await sendStudentSignupOTP(phoneNumber, studentName);
                
                if (otpResult.success) {
                    // Store OTP data for verification
                    const otpKey = `signup_${phoneNumber.replace(/\D/g, '')}`;
                    otpStore.set(otpKey, otpResult.otpData);
                    
                    // Remove OTP from response for security (only show in development)
                    if (process.env.NODE_ENV !== 'development') {
                        delete otpResult.data.otp;
                    }
                }
                
                return res.json(otpResult);

            case 'verify_otp':
                // Verify OTP for student signup
                const otpKey = `signup_${phoneNumber.replace(/\D/g, '')}`;
                const storedData = otpStore.get(otpKey);
                
                if (!storedData) {
                    return res.status(400).json({
                        success: false,
                        error: 'OTP_NOT_FOUND',
                        message: 'No OTP found for this phone number. Please request a new one.'
                    });
                }
                
                const verifyResult = await verifyStudentSignupOTP(phoneNumber, otp, storedData);
                
                if (verifyResult.success) {
                    // Remove used OTP
                    otpStore.delete(otpKey);
                }
                
                return res.json(verifyResult);

            case 'resend_otp':
                // Resend OTP for student signup
                const resendResult = await resendStudentSignupOTP(phoneNumber, studentName);
                
                if (resendResult.success) {
                    // Update stored OTP data
                    const resendKey = `signup_${phoneNumber.replace(/\D/g, '')}`;
                    otpStore.set(resendKey, resendResult.otpData);
                    
                    // Remove OTP from response for security
                    if (process.env.NODE_ENV !== 'development') {
                        delete resendResult.data.otp;
                    }
                }
                
                return res.json(resendResult);

            default:
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_ACTION',
                    message: 'Invalid action. Use send_otp, verify_otp, or resend_otp.'
                });
        }

    } catch (error) {
        console.error('Student signup API error:', error);
        return res.status(500).json({
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error. Please try again.'
        });
    }
}
