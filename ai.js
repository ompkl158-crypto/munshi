const https = require('https');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt, apiKey } = JSON.parse(event.body);
        
        const data = JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4000,
            messages: [{ role: "user", content: prompt }]
        });

        const options = {
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            }
        };

        const responseData = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => resolve({ statusCode: res.statusCode, body }));
            });
            req.on('error', (e) => reject(e));
            req.write(data);
            req.end();
        });

        return {
            statusCode: responseData.statusCode,
            headers: { 'Content-Type': 'application/json' },
            body: responseData.body
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
