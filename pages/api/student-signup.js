// Complete Student Signup OTP API - Direct connection to WhatsApp server
const axios = require('axios');

// Working WhatsApp API server
const WHATSAPP_API_URL = 'https://dmvwhaserver.vercel.app/send-message';

// Simple OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Generate random OTP
function generateOTP(length = 6) {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

// Send OTP via WhatsApp for student signup
async function sendStudentSignupOTP(phoneNumber, studentName = null) {
    try {
        // Format phone number for Sri Lanka
        let formattedNumber = phoneNumber.replace(/\D/g, '');
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '94' + formattedNumber.substring(1);
        }
        if (!formattedNumber.startsWith('94')) {
            formattedNumber = '94' + formattedNumber;
        }

        // Generate OTP
        const otpCode = generateOTP(6);

        // Create personalized OTP message
        let otpMessage;
        if (studentName) {
            otpMessage = `*🔐 Dampella LMS - Student Registration*\n--------------------------------\nDear ${studentName},\n\nYour verification code is: *${otpCode}*\n\nThis code will expire in 5 minutes.\n\nDo not share this code with anyone.\n\n🔗 Complete your registration: https://dampellamv.vercel.app/portal\n--------------------------------`;
        } else {
            otpMessage = `*🔐 Dampella LMS - Student Registration*\n--------------------------------\nYour verification code is: *${otpCode}*\n\nThis code will expire in 5 minutes.\n\nDo not share this code with anyone.\n\n🔗 Complete your registration: https://dampellamv.vercel.app/portal\n--------------------------------`;
        }

        // Send directly to working server
        const response = await axios.post(WHATSAPP_API_URL, {
            to: formattedNumber,
            text: otpMessage
        });

        // Store OTP for verification
        const otpData = {
            phoneNumber: formattedNumber,
            code: otpCode,
            timestamp: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
            messageId: response.data.data?.messageId
        };

        const otpKey = `signup_${formattedNumber}`;
        otpStore.set(otpKey, otpData);

        return {
            success: true,
            data: {
                expiresAt: otpData.expiresAt,
                messageId: otpData.messageId
            },
            message: 'OTP sent successfully via WhatsApp',
            // Include OTP for development testing
            ...(process.env.NODE_ENV === 'development' && { otp: otpCode })
        };

    } catch (error) {
        console.error('Student signup OTP error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message,
            message: 'Failed to send OTP for student registration'
        };
    }
}

// Verify OTP for student signup
async function verifyStudentSignupOTP(phoneNumber, enteredOTP) {
    try {
        // Format phone number
        let formattedNumber = phoneNumber.replace(/\D/g, '');
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '94' + formattedNumber.substring(1);
        }
        if (!formattedNumber.startsWith('94')) {
            formattedNumber = '94' + formattedNumber;
        }

        const otpKey = `signup_${formattedNumber}`;
        const storedOTPData = otpStore.get(otpKey);
        
        if (!storedOTPData) {
            return {
                success: false,
                error: 'OTP_NOT_FOUND',
                message: 'No OTP found for this phone number. Please request a new one.'
            };
        }

        // Check if OTP has expired
        if (Date.now() > storedOTPData.expiresAt) {
            otpStore.delete(otpKey);
            return {
                success: false,
                error: 'OTP_EXPIRED',
                message: 'OTP has expired. Please request a new one.'
            };
        }

        // Verify OTP
        if (enteredOTP === storedOTPData.code) {
            // Send confirmation message
            const confirmationMessage = `✅ *Registration Verified*\n--------------------------------\nYour phone number has been successfully verified.\n\nYou can now complete your student registration at Dampella LMS.\n\n🔗 Continue registration: https://dampellamv.vercel.app/portal\n--------------------------------`;

            await axios.post(WHATSAPP_API_URL, {
                to: formattedNumber,
                text: confirmationMessage
            });

            // Remove used OTP
            otpStore.delete(otpKey);

            return {
                success: true,
                message: 'OTP verified successfully. Registration can proceed.',
                verifiedAt: Date.now()
            };
        } else {
            return {
                success: false,
                error: 'INVALID_OTP',
                message: 'Invalid OTP. Please check and try again.'
            };
        }

    } catch (error) {
        console.error('OTP verification error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message,
            message: 'Failed to verify OTP'
        };
    }
}

// Resend OTP for student signup
async function resendStudentSignupOTP(phoneNumber, studentName = null) {
    try {
        // Clear existing OTP and send new one
        let formattedNumber = phoneNumber.replace(/\D/g, '');
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '94' + formattedNumber.substring(1);
        }
        if (!formattedNumber.startsWith('94')) {
            formattedNumber = '94' + formattedNumber;
        }

        const otpKey = `signup_${formattedNumber}`;
        otpStore.delete(otpKey);

        // Send new OTP
        const result = await sendStudentSignupOTP(phoneNumber, studentName);
        
        if (result.success) {
            return {
                success: true,
                message: 'New OTP sent successfully via WhatsApp',
                data: result.data
            };
        } else {
            return result;
        }

    } catch (error) {
        console.error('Resend OTP error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message,
            message: 'Failed to resend OTP'
        };
    }
}

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
        const { action, phoneNumber, studentName, otp } = req.body;

        switch (action) {
            case 'send_otp':
                const otpResult = await sendStudentSignupOTP(phoneNumber, studentName);
                return res.json(otpResult);

            case 'verify_otp':
                const verifyResult = await verifyStudentSignupOTP(phoneNumber, otp);
                return res.json(verifyResult);

            case 'resend_otp':
                const resendResult = await resendStudentSignupOTP(phoneNumber, studentName);
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
