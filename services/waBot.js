// waBot.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const QRCode = require('qrcode');

const app = express();
let latestQR = null;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox']
    }
});

client.on('qr', (qr) => {
    latestQR = qr;
    console.log("📱 QR updated — visit http://localhost:3333/qr to scan");
});

client.on('ready', () => {
    console.log("✅ WhatsApp bot is ready");
});

client.initialize();

// Serve QR via web
app.get('/qr', async (req, res) => {
    if (!latestQR) return res.send("No QR yet");
    const imgData = await QRCode.toDataURL(latestQR);
    res.send(`
      <h2>Scan this QR with your WhatsApp</h2>
      <img src="${imgData}" />
    `);
});

app.listen(3333, () => {
    console.log("🌐 QR server: http://localhost:3333/qr");
});

module.exports = client;
