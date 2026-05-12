const axios = require('axios');

// WireWeb API configuration (hardcoded to avoid env var issues)
const WIREWEB_BASE_URL = 'https://app.wireweb.co.in/api/v1/messages';
const WIREWEB_API_KEY = 'wire_b7PQuXK9vdm0P6R9o1uKdr4hL0s9kE2w';

// Send WhatsApp message via WireWeb
async function sendWhatsAppMessage(to, text, sessionId = null) {
    try {
        const response = await axios.post(`${WIREWEB_BASE_URL}`, {
            sessionId: sessionId || 'ws_default',
            to: to,
            text: text
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${WIREWEB_API_KEY}`
            }
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('WireWeb API Error:', error.message);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        return {
            success: false,
            error: error.message
        };
    }
}

// Format phone number for WhatsApp
function formatPhoneNumber(phone) {
    let number = phone.replace(/\D/g, '');
    if (number.startsWith('0')) {
        number = '94' + number.substring(1);
    }
    if (!number.startsWith('94')) {
        number = '94' + number;
    }
    return number;
}

// Message templates
const messageTemplates = {
    // OTP Verification
    otp: (data) => {
        return `*🔐 Dampella LMS Security*\n--------------------------------\nYour verification code is: *${data.code}*\n\nDo not share this code with anyone. Use it to verify your account on the portal.\n--------------------------------`;
    },

    // Assignment Notification
    assignment: (data) => {
        const subjectEmoji = {
            'Science': '🧬', 'Mathematics': '🔢', 'English': '🔤', 'Sinhala': '📝',
            'ICT': '💻', 'History': '🏛️', 'Geography': '🌍', 'Agri': '🌱',
            'Buddhism': '☸️', 'Music': '🎶', 'Drama': '🎭'
        }[data.subject] || '📚';

        return `📝 *NEW ASSIGNMENT POSTED*\n--------------------------------\n*SUBJECT:* ${subjectEmoji} ${data.subject}\n*FOR:* 🎓 ${data.grade}\n*BY:* 🧑‍🏫 ${data.teacherName || 'A Teacher'}\n\n📌 *TITLE:* ${data.title}\n⏰ *DUE DATE:* ${data.dueDate || 'TBA'}\n\n*INSTRUCTIONS:*\n${data.description ? data.description.substring(0, 200) + (data.description.length > 200 ? '...' : '') : 'See portal for details.'}\n\n🔗 *Access Portal:* https://dampellamv.vercel.app/portal\n--------------------------------`;
    },

    // Quiz/MCQ Notification
    quiz: (data) => {
        const subjectEmoji = {
            'Science': '🧬', 'Mathematics': '🔢', 'English': '🔤', 'Sinhala': '📝',
            'ICT': '💻', 'History': '🏛️', 'Geography': '🌍', 'Agri': '🌱',
            'Buddhism': '☸️', 'Music': '🎶', 'Drama': '🎭'
        }[data.subject] || '📚';

        return `🧠 *NEW INTERACTIVE QUIZ*\n--------------------------------\n*SUBJECT:* ${subjectEmoji} ${data.subject}\n*FOR:* 🎓 ${data.grade}\n*BY:* 🧑‍🏫 ${data.teacherName || 'A Teacher'}\n\n⭐ *QUIZ:* ${data.title}\n🚀 *Level Up your knowledge!*\n\n*SUMMARY:*\n${data.description || 'Test your skills with this new assessment!'}\n\n🔗 *Start Quiz Now:* https://dampellamv.vercel.app/portal\n--------------------------------`;
    },

    // Announcement
    announcement: (data) => {
        const emojiMap = { 
            'announcement': '📢', 'special-event': '🎉', 'upcoming-event': '🗓️', 
            'achievement': '🏆', 'sports': '🏅', 'club': '🤝', 'urgent': '🚨' 
        };
        const emoji = emojiMap[data.category] || '📌';

        return `${emoji} *NEW ANNOUNCEMENT*\n--------------------------------\n📌 *TITLE:* ${data.title}\n\n📝 *DETAILS:*\n${data.summary || data.content || 'See portal for details.'}\n\n🔗 *Read more:* https://dampellamv.vercel.app/news\n--------------------------------`;
    },

    // Teacher Approval
    teacherApproval: (data) => {
        return `*🎓 Dampella LMS Activation*\n--------------------------------\nCongratulations, *${data.fullName}*!\n\nYour teacher account has been *APPROVED* by the administrator. \n\nYou can now log in to the portal and start managing your classes, assignments, and quizzes.\n\n🔗 *Portal Login:* https://dampellamv.vercel.app/portal\n--------------------------------`;
    },

    // Custom Message
    custom: (data) => {
        return data.message || 'No message provided';
    }
};

// Vercel serverless function handler
module.exports = async (req, res) => {
    // Debug logging
    console.log('🔍 DEBUG: send-whatsapp API called');
    console.log('🔍 DEBUG: Method:', req.method);
    console.log('🔍 DEBUG: Headers:', req.headers);
    console.log('🔍 DEBUG: Body:', req.body);
    console.log('🔍 DEBUG: WIREWEB_API_KEY exists:', !!process.env.WIREWEB_API_KEY);
    console.log('🔍 DEBUG: WIREWEB_BASE_URL:', process.env.WIREWEB_BASE_URL);

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
        const { type, data, sessionId, to } = req.body;

        if (!type) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required field: type' 
            });
        }

        // Get message template
        const template = messageTemplates[type];
        if (!template) {
            return res.status(400).json({ 
                success: false, 
                error: `Unsupported message type: ${type}. Available types: ${Object.keys(messageTemplates).join(', ')}` 
            });
        }

        // Format message
        const messageText = template(data || {});

        // Determine recipient
        let recipient = to;
        if (!recipient && data.phoneNumber) {
            recipient = formatPhoneNumber(data.phoneNumber);
        } else if (!recipient && data.whatsapp_number) {
            recipient = formatPhoneNumber(data.whatsapp_number);
        }

        if (!recipient) {
            return res.status(400).json({ 
                success: false, 
                error: 'No recipient specified. Include "to" field or data with phoneNumber/whatsapp_number' 
            });
        }

        // Send message
        const result = await sendWhatsAppMessage(recipient, messageText, sessionId);

        res.json(result);

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
};
