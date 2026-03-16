async function testUpload() {
    const form = new FormData();
    const blob = new Blob(['hello world debug text'], { type: 'text/plain' });
    form.append('file', blob, 'debug.txt');

    try {
        const response = await fetch('https://epati-3pati6-srv.netlify.app/api/telegram-upload', {
            method: 'POST',
            body: form
        });
        
        const data = await response.json();
        require('fs').writeFileSync('test-out.json', JSON.stringify({status: response.status, data}, null, 2));
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testUpload();
