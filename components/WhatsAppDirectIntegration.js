// Direct WhatsApp Integration for Dampella LMS
// Connects directly to: https://dmvwhaserver.vercel.app/

const axios = require('axios');

// Working WhatsApp API server
const WHATSAPP_API_URL = 'https://dmvwhaserver.vercel.app/send-message';

// Generate random OTP
function generateOTP(length = 6) {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

// Send OTP for student signup - Direct integration
async function sendStudentOTP(phoneNumber, studentName = null) {
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

        return {
            success: true,
            data: {
                otp: otpCode, // Return OTP for development/testing
                messageId: response.data.data?.messageId,
                expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
            },
            message: 'OTP sent successfully via WhatsApp',
            phoneNumber: formattedNumber
        };

    } catch (error) {
        console.error('Student OTP error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message,
            message: 'Failed to send OTP for student registration'
        };
    }
}

// Send Assignment Notification - Direct integration
async function sendAssignmentNotification(phoneNumber, assignmentData) {
    try {
        // Format phone number
        let formattedNumber = phoneNumber.replace(/\D/g, '');
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '94' + formattedNumber.substring(1);
        }
        if (!formattedNumber.startsWith('94')) {
            formattedNumber = '94' + formattedNumber;
        }

        // Create assignment message
        const subjectEmoji = {
            'Science': '🧬', 'Mathematics': '🔢', 'English': '🔤', 'Sinhala': '📝',
            'ICT': '💻', 'History': '🏛️', 'Geography': '🌍', 'Agri': '🌱',
            'Buddhism': '☸️', 'Music': '🎶', 'Drama': '🎭'
        }[assignmentData.subject] || '📚';

        const assignmentMessage = `📝 *NEW ASSIGNMENT POSTED*\n--------------------------------\n*SUBJECT:* ${subjectEmoji} ${assignmentData.subject}\n*FOR:* 🎓 ${assignmentData.grade}\n*BY:* 🧑‍🏫 ${assignmentData.teacherName || 'A Teacher'}\n\n📌 *TITLE:* ${assignmentData.title}\n⏰ *DUE DATE:* ${assignmentData.dueDate || 'TBA'}\n\n*INSTRUCTIONS:*\n${assignmentData.description ? assignmentData.description.substring(0, 200) + (assignmentData.description.length > 200 ? '...' : '') : 'See portal for details.'}\n\n🔗 *Access Portal:* https://dampellamv.vercel.app/portal\n--------------------------------`;

        const response = await axios.post(WHATSAPP_API_URL, {
            to: formattedNumber,
            text: assignmentMessage
        });

        return {
            success: true,
            data: {
                messageId: response.data.data?.messageId
            },
            message: 'Assignment notification sent successfully'
        };

    } catch (error) {
        console.error('Assignment notification error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message,
            message: 'Failed to send assignment notification'
        };
    }
}

// Send Quiz Notification - Direct integration
async function sendQuizNotification(phoneNumber, quizData) {
    try {
        // Format phone number
        let formattedNumber = phoneNumber.replace(/\D/g, '');
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '94' + formattedNumber.substring(1);
        }
        if (!formattedNumber.startsWith('94')) {
            formattedNumber = '94' + formattedNumber;
        }

        // Create quiz message
        const subjectEmoji = {
            'Science': '🧬', 'Mathematics': '🔢', 'English': '🔤', 'Sinhala': '📝',
            'ICT': '💻', 'History': '🏛️', 'Geography': '🌍', 'Agri': '🌱',
            'Buddhism': '☸️', 'Music': '🎶', 'Drama': '🎭'
        }[quizData.subject] || '📚';

        const quizMessage = `🧠 *NEW INTERACTIVE QUIZ*\n--------------------------------\n*SUBJECT:* ${subjectEmoji} ${quizData.subject}\n*FOR:* 🎓 ${quizData.grade}\n*BY:* 🧑‍🏫 ${quizData.teacherName || 'A Teacher'}\n\n⭐ *QUIZ:* ${quizData.title}\n🚀 *Level Up your knowledge!*\n\n*SUMMARY:*\n${quizData.description || 'Test your skills with this new assessment!'}\n\n🔗 *Start Quiz Now:* https://dampellamv.vercel.app/portal\n--------------------------------`;

        const response = await axios.post(WHATSAPP_API_URL, {
            to: formattedNumber,
            text: quizMessage
        });

        return {
            success: true,
            data: {
                messageId: response.data.data?.messageId
            },
            message: 'Quiz notification sent successfully'
        };

    } catch (error) {
        console.error('Quiz notification error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message,
            message: 'Failed to send quiz notification'
        };
    }
}

// Send Announcement - Direct integration
async function sendAnnouncement(phoneNumber, announcementData) {
    try {
        // Format phone number
        let formattedNumber = phoneNumber.replace(/\D/g, '');
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '94' + formattedNumber.substring(1);
        }
        if (!formattedNumber.startsWith('94')) {
            formattedNumber = '94' + formattedNumber;
        }

        // Create announcement message
        const emojiMap = { 
            'announcement': '📢', 'special-event': '🎉', 'upcoming-event': '🗓️', 
            'achievement': '🏆', 'sports': '🏅', 'club': '🤝', 'urgent': '🚨' 
        };
        const emoji = emojiMap[announcementData.category] || '📌';

        const announcementMessage = `${emoji} *NEW ANNOUNCEMENT*\n--------------------------------\n📌 *TITLE:* ${announcementData.title}\n\n📝 *DETAILS:*\n${announcementData.summary || announcementData.content || 'See portal for details.'}\n\n🔗 *Read more:* https://dampellamv.vercel.app/news\n--------------------------------`;

        const response = await axios.post(WHATSAPP_API_URL, {
            to: formattedNumber,
            text: announcementMessage
        });

        return {
            success: true,
            data: {
                messageId: response.data.data?.messageId
            },
            message: 'Announcement sent successfully'
        };

    } catch (error) {
        console.error('Announcement error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message,
            message: 'Failed to send announcement'
        };
    }
}

// Test direct integration
async function testDirectIntegration() {
    console.log('🧪 Testing Direct WhatsApp Integration...');
    
    try {
        // Test OTP
        console.log('\n📱 Testing OTP...');
        const otpResult = await sendStudentOTP('0771234567', 'Test Student');
        console.log('✅ OTP Result:', otpResult);

        // Test Assignment
        console.log('\n📝 Testing Assignment...');
        const assignmentResult = await sendAssignmentNotification('0771234567', {
            subject: 'Mathematics',
            grade: 'Grade 10',
            teacherName: 'Test Teacher',
            title: 'Algebra Homework',
            description: 'Complete exercises 5.1 to 5.5',
            dueDate: '2026-05-20'
        });
        console.log('✅ Assignment Result:', assignmentResult);

        // Test Quiz
        console.log('\n🧠 Testing Quiz...');
        const quizResult = await sendQuizNotification('0771234567', {
            subject: 'Science',
            grade: 'Grade 10',
            teacherName: 'Dr. Test Teacher',
            title: 'Biology Quiz',
            description: 'Multiple choice quiz on cell structure'
        });
        console.log('✅ Quiz Result:', quizResult);

        // Test Announcement
        console.log('\n📢 Testing Announcement...');
        const announcementResult = await sendAnnouncement('0771234567', {
            category: 'announcement',
            title: 'Test Announcement',
            summary: 'This is a test announcement from Dampella LMS'
        });
        console.log('✅ Announcement Result:', announcementResult);

    } catch (error) {
        console.error('❌ Test Error:', error);
    }
}

// Export functions for direct use in Dampella LMS
module.exports = {
    sendStudentOTP,
    sendAssignmentNotification,
    sendQuizNotification,
    sendAnnouncement,
    testDirectIntegration
};

// Run test if called directly
if (require.main === module) {
    testDirectIntegration();
}
