// WhatsApp OTP Integration for Dampella LMS Student Signup
// Using working server: https://dmvwhaserver.vercel.app/

// This module provides client-side wrappers that call the server API
// The actual WireWeb API calls are performed in `pages/api/send-otp.js`.

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
export async function sendStudentSignupOTP(phoneNumber, studentName = null) {
    try {
        const resp = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, studentName })
        });

        const data = await resp.json();
        if (!resp.ok) return { success: false, message: data?.message || data?.error || 'Failed' };

        // Construct otpData for client usage
        const otpData = {
            phoneNumber: phoneNumber.replace(/\D/g, ''),
            code: data.otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
            messageId: data.messageId || null
        };

        console.log('[WhatsAppOTP] sendStudentSignupOTP response', data);

        return {
            success: true,
            data: { otp: data.otp },
            otpData,
            message: 'OTP send requested'
        };
    } catch (err) {
        console.error('[WhatsAppOTP] sendStudentSignupOTP error', err);
        return { success: false, message: err.message || 'Failed to send OTP' };
    }
}

// Verify OTP for student signup
export async function verifyStudentSignupOTP(phoneNumber, enteredOTP, storedOTPData) {
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
            // Send confirmation message via server API so API key is not exposed client-side
            const confirmationMessage = `✅ *Registration Verified*\n\nYour phone number has been successfully verified.\n\nYou can now complete your student registration at Dampella LMS.\n\n🔗 Continue registration: https://dampellamv.vercel.app/portal`;

            try {
                await fetch('/api/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber: formattedNumber, text: confirmationMessage })
                });
            } catch (e) {
                console.warn('[WhatsAppOTP] confirmation send failed', e);
            }

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
export async function resendStudentSignupOTP(phoneNumber, studentName = null) {
    try {
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
