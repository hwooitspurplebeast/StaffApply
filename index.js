// server.js
const express = require('express');
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const moment = require('moment');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://jwtez-780f2.appspot.com'
});

app.use(express.static('public'));
app.use(express.json());

app.post('/submit-data', async (req, res) => {
    try {
        const data = req.body;
        const textData = `Full Name: ${data.name}\nEmail: ${data.email}\nAge: ${data.age}\nReason to Join JwClan: ${data.reason}\nLevels in Free Fire: ${data.levels}\nUID: ${data.uid}\nSince you are playing Free Fire: ${data.playtime}\n`;

        // Generate filename with datestamp and user IP address
        const datestamp = moment().format('YYYY-MM-DD-HH-mm-ss');
        const userIp = req.ip.replace(/:/g, '_'); // Replace colons in IPv6 with underscores
        const filename = `${data.name}-${datestamp}-${userIp}.txt`;

        const bucket = admin.storage().bucket();
        const file = bucket.file(filename);
        await file.save(textData);
        res.send('Data saved successfully to cloud wait for 2-4 days your application will be reviewed by our staff');
    } catch (error) {
        console.error('Error saving data to Firebase Cloud Storage:', error);
        res.status(500).send('An error occurred while saving data.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
