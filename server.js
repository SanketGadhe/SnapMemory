// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const participantRoutes = require("./routes/participantRoutes");
const os = require('os');
const networkInterfaces = os.networkInterfaces();
require('dotenv').config();
connectDB();

const tripRoutes = require('./routes/tripRoutes');
const photoRoutes = require('./routes/photoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


app.use("/api/trips", tripRoutes);
app.use("/api/photos", photoRoutes);

app.use('/api/participants', participantRoutes);
// app.use('/api/photos', photoRoutes);

const getLocalIp = () => {
    for (let iface of Object.values(networkInterfaces)) {
        for (let config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                return config.address;
            }
        }
    }
    return 'localhost';
};


const HOST = getLocalIp();
app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});