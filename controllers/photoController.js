const Person = require("../models/Person");
const Trip = require("../models/Trip");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const expo = require("expo-server-sdk")
const ExpoToken = require("../models/ExpoToken")
exports.detectFaces = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No selfie uploaded" });
        }

        const imagePath = req.file.path;

        const flaskUrl = `${process.env.FLASK_APP}/api/memorysnap/recognize`;

        const formData = new FormData();
        formData.append("file", fs.createReadStream(imagePath));

        const response = await axios.post(flaskUrl, formData, {
            headers: formData.getHeaders()
        });

        // Optional: delete the file after sending
        fs.unlinkSync(imagePath);

        res.json({
            message: "Faces detected successfully",
            croppedFaces: response.data.faces,
        });
    } catch (error) {
        console.error("Face detection error:", error.message);
        res.status(500).json({ message: "Face detection failed" });
    }
};
exports.classifyPhotos = async (req, res) => {
    try {
        const { tripId } = req.body;

        if (!tripId || !req.files || req.files.length === 0) {
            return res.status(400).json({ message: "tripId and images[] are required" });
        }

        const trip = await Trip.findById(tripId);
        if (!trip || !trip.tripEmbedding) {
            return res.status(404).json({ message: "Trip or embedding not found" });
        }

        const imagePaths = req.files.map(file =>
            path.resolve(file.path)
        );

        const flaskResponse = await axios.post(`${process.env.FLASK_APP}/classify-faces`, {
            tripId,
            embeddingPath: trip.tripEmbedding,
            imagePaths
        });

        const results = flaskResponse.data.results || [];
        for (const result of results) {
            const { imagePath, recognized } = result;

            if (recognized.length === 1) {
                await Person.findByIdAndUpdate(recognized[0], {
                    $push: { selfPhotos: imagePath }
                });
            } else if (recognized.length > 1) {
                await Person.updateMany(
                    { _id: { $in: recognized } },
                    { $push: { alongWithSomeonePhotos: imagePath } }
                );
            }
        }

        // // ✅ FETCH TOKENS FROM DB
        // const tokens = await ExpoToken.find({});
        // const messages = tokens
        //     .filter(t => Expo.isExpoPushToken(t.token))
        //     .map(t => ({
        //         to: t.token,
        //         title: 'Trip is ready!',
        //         body: 'Your photos are processed. View the summary now.',
        //         data: { screen: 'Summary' }
        //     }));

        // const chunks = expo.chunkPushNotifications(messages);
        // for (const chunk of chunks) {
        //     try {
        //         await expo.sendPushNotificationsAsync(chunk);
        //     } catch (error) {
        //         console.error('❌ Error sending chunked notifications:', error);
        //     }
        // }

        res.status(200).json({
            message: "Photos processed and mapped to participants",
        });

    } catch (error) {
        console.error("❌ Error in classifyPhotos:", error.message);
        res.status(500).json({ message: "Classification failed" });
    }
};
