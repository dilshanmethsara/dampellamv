// Simple OTP verification storage (in production, use Redis or database)
const otpStore = new Map();

// Vercel serverless function for OTP verification
module.exports = async (req, res) => {
    // Debug logging
    console.log('🔍 DEBUG: verify-otp API called');
    console.log('🔍 DEBUG: Method:', req.method);
    console.log('🔍 DEBUG: Body:', req.body);
    console.log('🔍 DEBUG: OTP Store size:', otpStore.size);

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { phoneNumber, code, action } = req.body;

        if (!phoneNumber || !code) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: phoneNumber and code' 
            });
        }

        // Normalize phone number
        const normalizedPhone = phoneNumber.replace(/\D/g, '');
        const otpKey = `${normalizedPhone}_${code}`;

        if (action === 'store') {
            // Store OTP for 5 minutes
            const expiry = Date.now() + (5 * 60 * 1000);
            otpStore.set(otpKey, { 
                code, 
                phoneNumber: normalizedPhone, 
                created: Date.now(),
                expiry 
            });
            
            return res.json({ 
                success: true, 
                message: 'OTP stored successfully',
                expiresIn: 300
            });
        }

        if (action === 'verify') {
            // Verify OTP
            const storedOtp = otpStore.get(otpKey);
            
            if (!storedOtp) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid or expired OTP' 
                });
            }

            if (Date.now() > storedOtp.expiry) {
                otpStore.delete(otpKey);
                return res.status(400).json({ 
                    success: false, 
                    error: 'OTP has expired' 
                });
            }

            // OTP is valid - remove it
            otpStore.delete(otpKey);
            
            return res.json({ 
                success: true, 
                message: 'OTP verified successfully',
                verified: true
            });
        }

        return res.status(400).json({ 
            success: false, 
            error: 'Invalid action. Use "store" or "verify"' 
        });

    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
};
