// WhatsApp OTP Integration for Dampella LMS Student Signup
// Using working server: https://dmvwhaserver.vercel.app/

import axios from 'axios';

// Working WhatsApp API server
const WHATSAPP_API_URL = 'https://dmvwhaserver.vercel.app/send-message';

export async function sendStudentSignupOTP(phoneNumber, fullName) {
  try {
    const response = await axios.post(WHATSAPP_API_URL, { 
      phoneNumber, 
      fullName 
    });
    return {
      success: true,
      otpData: response.data,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send OTP'
    };
  }
}

export async function verifyStudentSignupOTP(phoneNumber, otp, storedOTPData) {
  try {
    const response = await axios.post(`${WHATSAPP_API_URL}/verify`, { 
      phoneNumber, 
      otp, 
      storedOTPData 
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'OTP verification failed'
    };
  }
}

export async function resendStudentSignupOTP(phoneNumber, fullName) {
  try {
    const response = await axios.post(`${WHATSAPP_API_URL}/resend`, { 
      phoneNumber, 
      fullName 
    });
    return {
      success: true,
      otpData: response.data,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to resend OTP'
    };
  }
}

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

        // Send via working server
        const response = await axios.post(WHATSAPP_API_URL, {
            to: formattedNumber,
            text: otpMessage
        });

        // Store OTP for verification (in production, use Redis or database)
        const otpData = {
            phoneNumber: formattedNumber,
            code: otpCode,
            timestamp: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
            messageId: response.data.data?.messageId
        };

        return {
            success: true,
            data: {
                otp: otpCode, // Return OTP for development/testing
                expiresAt: otpData.expiresAt,
                messageId: otpData.messageId
            },
            message: 'OTP sent successfully via WhatsApp',
            otpData: otpData // For storage
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
async function verifyStudentSignupOTP(phoneNumber, enteredOTP, storedOTPData) {
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
            // Send confirmation message
            const confirmationMessage = `✅ *Registration Verified*\n--------------------------------\nYour phone number has been successfully verified.\n\nYou can now complete your student registration at Dampella LMS.\n\n🔗 Continue registration: https://dampellamv.vercel.app/portal\n--------------------------------`;

            await axios.post(WHATSAPP_API_URL, {
                to: formattedNumber,
                text: confirmationMessage
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
async function resendStudentSignupOTP(phoneNumber, studentName = null) {
    try {
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

// React/Next.js Component for Student Signup OTP
export function StudentSignupOTPComponent() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [storedOTPData, setStoredOTPData] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsOTPSent(true);
        setError('');
        setSuccess('');

        try {
            const result = await sendStudentSignupOTP(phoneNumber);
            
            if (result.success) {
                setStoredOTPData(result.otpData);
                setSuccess('OTP sent to your WhatsApp! Please check your messages.');
                
                // In development, show the OTP
                if (process.env.NODE_ENV === 'development') {
                    console.log('Development OTP:', result.data.otp);
                }
            } else {
                setError(result.message);
                setIsOTPSent(false);
            }
        } catch (error) {
            setError('Failed to send OTP. Please try again.');
            setIsOTPSent(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsVerifying(true);
        setError('');
        setSuccess('');

        try {
            const result = await verifyStudentSignupOTP(phoneNumber, otp, storedOTPData);
            
            if (result.success) {
                setSuccess('Phone number verified successfully! Proceeding with registration...');
                // Proceed to next step of registration
                setTimeout(() => {
                    // Navigate to next registration step
                    window.location.href = '/registration/step-3';
                }, 2000);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setSuccess('');

        try {
            const result = await resendStudentSignupOTP(phoneNumber);
            
            if (result.success) {
                setStoredOTPData(result.otpData);
                setSuccess('New OTP sent to your WhatsApp!');
                
                if (process.env.NODE_ENV === 'development') {
                    console.log('Development OTP:', result.data.otp);
                }
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Failed to resend OTP. Please try again.');
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">Student Registration</h2>
            
            {!isOTPSent ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number (WhatsApp)
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="0771234567"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Enter your WhatsApp number to receive verification code
                        </p>
                    </div>
                    
                    <button
                        onClick={handleSendOTP}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Send OTP via WhatsApp
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Enter the 6-digit code sent to your WhatsApp
                        </p>
                    </div>
                    
                    <button
                        onClick={handleVerifyOTP}
                        disabled={isVerifying}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50"
                    >
                        {isVerifying ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    
                    <button
                        onClick={handleResendOTP}
                        className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-200"
                    >
                        Resend OTP
                    </button>
                </div>
            )}
            
            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}
        </div>
    );
}

// Export functions for backend use
module.exports = {
    sendStudentSignupOTP,
    verifyStudentSignupOTP,
    resendStudentSignupOTP,
    generateOTP
};
