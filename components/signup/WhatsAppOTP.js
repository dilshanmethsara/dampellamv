// WhatsApp OTP Integration for Dampella LMS Student Signup
// Using working server: https://dmvwhaserver.vercel.app/

import axios from 'axios';

// WireWeb API configuration
const WIREWEB_API_URL = 'https://app.wireweb.co.in/api/v1/messages';
const WIREWEB_API_KEY = process.env.NEXT_PUBLIC_WIREWEB_API_KEY;
const WIREWEB_SESSION_ID = process.env.NEXT_PUBLIC_WIREWEB_SESSION_ID;

// Generate random OTP
function generateOTP(length = 6) {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

// Send OTP via WireWeb WhatsApp for student signup
export async function sendStudentSignupOTPClient(phoneNumber, studentName = null) {
    try {
        // Format phone number for Sri Lanka
        let formattedNumber = phoneNumber.replace(/\D/g, '');
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '94' + formattedNumber.substring(1);
        }
        if (!formattedNumber.startsWith('94')) {
            formattedNumber = '94' + formattedNumber;
        }

        // Add @s.whatsapp.net for WhatsApp JID format
        const whatsappJID = formattedNumber + '@s.whatsapp.net';

        // Generate OTP
        const otpCode = generateOTP(6);

        // Create personalized OTP message
        let otpMessage;
        if (studentName) {
            otpMessage = `🔐 *Dampella LMS - Student Registration*\n\nDear ${studentName},\n\nYour verification code is: *${otpCode}*\n\nThis code will expire in 5 minutes.\n\nDo not share this code with anyone.\n\n🔗 Complete your registration: https://dampellamv.vercel.app/portal`;
        } else {
            otpMessage = `🔐 *Dampella LMS - Student Registration*\n\nYour verification code is: *${otpCode}*\n\nThis code will expire in 5 minutes.\n\nDo not share this code with anyone.\n\n🔗 Complete your registration: https://dampellamv.vercel.app/portal`;
        }

        // Send via WireWeb API
        const response = await axios.post(WIREWEB_API_URL, {
            sessionId: WIREWEB_SESSION_ID,
            to: whatsappJID,
            text: otpMessage
        }, {
            headers: {
                'Authorization': `Bearer ${WIREWEB_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Store OTP for verification
        const otpData = {
            phoneNumber: formattedNumber,
            code: otpCode,
            timestamp: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000),
            messageId: response.data.messageId
        };

        return {
            success: true,
            data: {
                otp: otpCode,
                expiresAt: otpData.expiresAt,
                messageId: otpData.messageId
            },
            message: 'OTP sent successfully via WhatsApp',
            otpData: otpData
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
export async function verifyStudentSignupOTPClient(phoneNumber, enteredOTP, storedOTPData) {
    try {
        // Format phone number
        let formattedNumber = phoneNumber.replace(/\D/g, '');
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '94' + formattedNumber.substring(1);
        }
        if (!formattedNumber.startsWith('94')) {
            formattedNumber = '94' + formattedNumber;
        }

        // Check if OTP has expired
        if (Date.now() > storedOTPData.expiresAt) {
            return {
                success: false,
                error: 'OTP_EXPIRED',
                message: 'OTP has expired. Please request a new one.'
            };
        }

        // Verify OTP
        if (formattedNumber === storedOTPData.phoneNumber && enteredOTP === storedOTPData.code) {
            // Send confirmation message via WireWeb
            const confirmationMessage = `✅ *Registration Verified*\n\nYour phone number has been successfully verified.\n\nYou can now complete your student registration at Dampella LMS.\n\n🔗 Continue registration: https://dampellamv.vercel.app/portal`;

            const whatsappJID = formattedNumber + '@s.whatsapp.net';

            await axios.post(WIREWEB_API_URL, {
                sessionId: WIREWEB_SESSION_ID,
                to: whatsappJID,
                text: confirmationMessage
            }, {
                headers: {
                    'Authorization': `Bearer ${WIREWEB_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

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
export async function resendStudentSignupOTPClient(phoneNumber, studentName = null) {
    try {
        const result = await sendStudentSignupOTPClient(phoneNumber, studentName);
        
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
