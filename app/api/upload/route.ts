import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl || webhookUrl.includes('YOUR_URL_HERE')) {
      return NextResponse.json({ 
        error: 'Discord Webhook URL is not configured. Please set DISCORD_WEBHOOK_URL in .env.local' 
      }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. Prepare Discord form data
    const discordForm = new FormData();
    // Discord identifies the file by the field name "file" or "files[0]"
    discordForm.append('file', file);
    discordForm.append('payload_json', JSON.stringify({
      content: `📦 **New LMS Resource Uploaded**\nFilename: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB`
    }));

    // 2. Forward to Discord Webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: discordForm,
      // No standard User-Agent needed for Discord, but keeps it consistent
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API Error:', errorText);
      return NextResponse.json({ 
        error: `Discord upload failed: ${response.statusText}` 
      }, { status: 500 });
    }

    const discordResponse = await response.json();
    
    // 3. Extract the permanent CDN URL from the first attachment
    const cdnUrl = discordResponse.attachments?.[0]?.url;

    if (!cdnUrl) {
      return NextResponse.json({ 
        error: 'Failed to retrieve CDN URL from Discord response.' 
      }, { status: 500 });
    }

    // 4. Return the public CDN URL
    return NextResponse.json({ url: cdnUrl });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
