// Simple test endpoint to verify Vercel deployment
module.exports = async (req, res) => {
    console.log('🔍 DEBUG: Test endpoint called');
    console.log('🔍 DEBUG: Method:', req.method);
    console.log('🔍 DEBUG: URL:', req.url);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    res.json({ 
        success: true, 
        message: 'Vercel deployment working!',
        timestamp: new Date().toISOString(),
        environment: {
            hasWireWebKey: !!process.env.WIREWEB_API_KEY,
            hasWireWebUrl: !!process.env.WIREWEB_BASE_URL
        }
    });
};
