// Student Signup Page with WhatsApp OTP Integration
import { useState } from 'react';

export default function StudentSignup() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        grade: '',
        email: '',
        phoneNumber: '',
        parentName: '',
        parentPhone: ''
    });
    const [otp, setOtp] = useState('');
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [storedOTPData, setStoredOTPData] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateStep1 = () => {
        if (!formData.fullName || !formData.grade || !formData.email || !formData.phoneNumber) {
            setError('Please fill in all required fields');
            return false;
        }
        if (formData.phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
            return false;
        }
        return true;
    };

    const handleSendOTP = async () => {
        if (!validateStep1()) return;

        setIsOTPSent(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/student-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'send_otp', phoneNumber: formData.phoneNumber, studentName: formData.fullName })
            });
            const result = await res.json();

            if (result.success) {
                setStoredOTPData(result);
                setSuccess('OTP sent to your WhatsApp! Please check your messages.');
                if (process.env.NODE_ENV === 'development' && result.otp) {
                    console.log('Development OTP:', result.otp);
                }
            } else {
                setError(result.message || 'Failed to send OTP');
                setIsOTPSent(false);
            }
        } catch (err) {
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
            const res = await fetch('/api/student-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify_otp', phoneNumber: formData.phoneNumber, otp })
            });
            const result = await res.json();

            if (result.success) {
                setSuccess('Phone number verified successfully! Proceeding with registration...');
                setStep(3);
            } else {
                setError(result.message || 'Invalid or expired OTP');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/student-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'resend_otp', phoneNumber: formData.phoneNumber, studentName: formData.fullName })
            });
            const result = await res.json();

            if (result.success) {
                setStoredOTPData(result);
                setSuccess('New OTP sent to your WhatsApp!');

                if (process.env.NODE_ENV === 'development' && result.otp) {
                    console.log('Development OTP:', result.otp);
                }
            } else {
                setError(result.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError('Failed to resend OTP. Please try again.');
        }
    };

    const handleSubmitRegistration = async () => {
        setError('');
        setSuccess('');

        try {
            // Submit registration data to your backend
            const response = await fetch('/api/register-student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                setSuccess('Registration completed successfully! You can now login to the portal.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else {
                setError(result.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Student Registration
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Register for Dampella LMS
                    </p>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-8">
                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Grade *
                                </label>
                                <select
                                    name="grade"
                                    value={formData.grade}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Select Grade</option>
                                    <option value="Grade 6">Grade 6</option>
                                    <option value="Grade 7">Grade 7</option>
                                    <option value="Grade 8">Grade 8</option>
                                    <option value="Grade 9">Grade 9</option>
                                    <option value="Grade 10">Grade 10</option>
                                    <option value="Grade 11">Grade 11</option>
                                    <option value="Grade 12">Grade 12</option>
                                    <option value="Grade 13">Grade 13</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    WhatsApp Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="0771234567"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Enter your WhatsApp number to receive verification code
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Parent/Guardian Name
                                </label>
                                <input
                                    type="text"
                                    name="parentName"
                                    value={formData.parentName}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Parent/Guardian Phone
                                </label>
                                <input
                                    type="tel"
                                    name="parentPhone"
                                    value={formData.parentPhone}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <button
                                onClick={handleSendOTP}
                                disabled={isOTPSent}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {isOTPSent ? 'Sending OTP...' : 'Send OTP via WhatsApp'}
                            </button>
                        </div>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Verify Your Phone Number
                                </h3>
                                <p className="text-sm text-gray-600">
                                    We've sent a 6-digit code to your WhatsApp
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-xl"
                                />
                            </div>

                            <button
                                onClick={handleVerifyOTP}
                                disabled={isVerifying}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {isVerifying ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <button
                                onClick={handleResendOTP}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Resend OTP
                            </button>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Back to Registration
                            </button>
                        </div>
                    )}

                    {/* Step 3: Registration Complete */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Phone Verified Successfully!
                                </h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Your phone number has been verified. Click below to complete your registration.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Registration Details:</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>Name:</strong> {formData.fullName}</p>
                                    <p><strong>Grade:</strong> {formData.grade}</p>
                                    <p><strong>Email:</strong> {formData.email}</p>
                                    <p><strong>Phone:</strong> {formData.phoneNumber}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmitRegistration}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Complete Registration
                            </button>
                        </div>
                    )}

                    {/* Error and Success Messages */}
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
            </div>
        </div>
    );
}
