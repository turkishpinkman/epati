const HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS, POST'
};

exports.handler = async function (event, context) {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: HEADERS,
            body: ''
        };
    }

    // Sadece POST isteklerine izin ver
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: HEADERS,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { senderEmail, adoptionTitle, message } = body;

        // Telegram Bot Token ve Chat ID'yi çevre değişkenlerinden (environment variables) alıyoruz
        const botToken = process.env.ADOPTION_TELEGRAM_BOT_TOKEN;
        const chatId = process.env.ADOPTION_TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.error('Missing Telegram Bot Token or Chat ID');
            return {
                statusCode: 500,
                headers: HEADERS,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }

        // Telegram mesaj içeriği
        const text = `🐾 **Yeni Sahiplendirme Mesajı** 🐾\n\n📌 **İlan:** ${adoptionTitle}\n✉️ **Gönderen:** ${senderEmail}\n\n💬 **Mesaj:**\n${message}`;

        // Telegram API Endpoint
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        // Telegram'a istek at
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Telegram API Error:', errorData);
            return {
                statusCode: 502,
                headers: HEADERS,
                body: JSON.stringify({ error: 'Failed to send message to Telegram', details: errorData })
            };
        }

        return {
            statusCode: 200,
            headers: HEADERS,
            body: JSON.stringify({ success: true, message: 'Message sent via Telegram.' })
        };
    } catch (error) {
        console.error('Function execution error:', error.message);
        return {
            statusCode: 500,
            headers: HEADERS,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
};
