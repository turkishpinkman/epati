// Netlify Serverless Function — Telegram File Upload Proxy
// Receives a file from client, forwards to Telegram sendDocument API

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default async (req) => {
    // Preflight CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    }

    const BOT_TOKEN = Netlify.env.get('TELEGRAM_BOT_TOKEN');
    const CHAT_ID = Netlify.env.get('TELEGRAM_CHAT_ID');

    if (!BOT_TOKEN || !CHAT_ID) {
        return new Response(JSON.stringify({ error: 'Server configuration missing' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            });
        }

        // Telegram API'ye gönderilecek FormData
        const telegramForm = new FormData();
        telegramForm.append('chat_id', CHAT_ID);
        telegramForm.append('document', file, file.name || 'photo.jpg');

        const telegramRes = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
            {
                method: 'POST',
                body: telegramForm,
            }
        );

        const telegramData = await telegramRes.json();

        if (!telegramData.ok) {
            console.error('Telegram API error:', telegramData);
            return new Response(JSON.stringify({ error: 'Telegram upload failed', details: telegramData.description }), {
                status: 502,
                headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            });
        }

        // sendDocument yanıtından file_id'yi çıkar
        const document = telegramData.result.document;
        const fileId = document.file_id;
        const fileName = document.file_name || 'unknown';

        return new Response(JSON.stringify({ file_id: fileId, file_name: fileName }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    } catch (error) {
        console.error('Upload proxy error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    }
};

export const config = {
    path: '/api/telegram-upload',
};
