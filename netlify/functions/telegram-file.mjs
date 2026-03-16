// Netlify Serverless Function — Telegram File URL Resolver
// Receives a file_id, calls Telegram getFile API, returns the full download URL

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default async (req) => {
    // Preflight CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(req.url);
    const fileId = url.searchParams.get('file_id');

    if (!fileId) {
        return new Response(JSON.stringify({ error: 'file_id parameter required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    }

    const BOT_TOKEN = Netlify.env.get('TELEGRAM_BOT_TOKEN');

    if (!BOT_TOKEN) {
        return new Response(JSON.stringify({ error: 'Server configuration missing' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    }

    try {
        const telegramRes = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`
        );

        const telegramData = await telegramRes.json();

        if (!telegramData.ok) {
            console.error('Telegram getFile error:', telegramData);
            return new Response(JSON.stringify({ error: 'Failed to get file info', details: telegramData.description }), {
                status: 502,
                headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            });
        }

        const filePath = telegramData.result.file_path;
        const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

        return new Response(JSON.stringify({ url: downloadUrl }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600',
                ...CORS_HEADERS,
            },
        });
    } catch (error) {
        console.error('File resolver error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    }
};

export const config = {
    path: '/api/telegram-file',
};
