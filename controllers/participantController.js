const Person = require("../models/Person");
const Trip = require("../models/Trip");
const axios = require("axios");
const waBot = require('../services/waBot');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');

exports.createParticipants = async (req, res) => {
    try {
        const { tripId, people } = req.body;

        if (!tripId || !Array.isArray(people) || people.length === 0) {
            return res.status(400).json({ message: "tripId and people array are required" });
        }

        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const created = [];
        const faceTrainingData = [];

        for (const person of people) {
            const { name, phone, faceUrl } = person;
            if (!name || !phone || !faceUrl) continue;

            const newPerson = new Person({
                tripId: trip._id,
                tripName: trip.tripName,
                name,
                phone,
                faceUrl,
                photos: []
            });

            await newPerson.save();
            trip.participants.push(newPerson._id);
            created.push(newPerson);

            faceTrainingData.push({
                person_id: newPerson._id,
                imageUrl: faceUrl
            });
        }

        await trip.save();

        // 🔁 Send to Flask for training
        try {
            const flaskResponse = await axios.post(`${process.env.FLASK_APP}/train-embeddings`, {
                tripId: trip._id,
                faces: faceTrainingData
            });

            const { embeddingPath } = flaskResponse.data;

            if (embeddingPath) {
                trip.tripEmbedding = embeddingPath;
                await trip.save();
            }

            console.log("✅ Embedding training triggered:", flaskResponse.data);
        } catch (flaskErr) {
            console.warn("⚠️ Error sending to Flask:", flaskErr.message);
        }

        res.status(201).json({
            message: "Participants saved and training triggered",
            participants: created
        });
    } catch (error) {
        console.error("❌ Error saving participants:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};


exports.sendWhatsAppLinkDirectly = async (req, res) => {
    try {
        const { tripId, personId } = req.query;

        if (!tripId || !personId) {
            return res.status(400).json({ message: "tripId and personId are required" });
        }

        const person = await Person.findOne({ _id: personId, tripId });
        const trip = await Trip.findById(tripId);

        if (!person || !trip) {
            return res.status(404).json({ message: "Participant or Trip not found" });
        }

        const viewLink = `${process.env.VIEW_PAGE_URL}/view/${person._id}?trip=${tripId}`;

        const individualCount = person.selfPhotos?.length || 0;
        const groupCount = person.alongWithSomeonePhotos?.length || 0;
        const totalCount = individualCount + groupCount;

        const message = `
Hey ${person.name}! 👋

Your trip memories from *${trip.tripName}* on *${new Date(trip.date).toDateString()}* are ready 📸

🧍 Solo Photos: ${individualCount}
👥 Group Photos: ${groupCount}
📸 Total: ${totalCount}

👇 Tap to view & download:
${viewLink}

Enjoy and relive the moments with FaceShare 💖
`.trim();

        const personPhoneNo = "+91" + person.phone;
        console.log("Person Phone", personPhoneNo)
        const chatId = personPhoneNo.replace('+', '') + "@c.us"; // WhatsApp ID format

        await waBot.sendMessage(chatId, message);

        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("❌ Error sending WhatsApp message:", error.message);
        res.status(500).json({ message: "Failed to send WhatsApp message" });
    }
};

exports.sendAllToWhatsApp = async (req, res) => {
    try {
        const { personIds, tripId } = req.body;

        if (!personIds || !tripId || !Array.isArray(personIds)) {
            return res.status(400).json({ message: "tripId and personIds[] are required" });
        }

        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const participants = await Person.find({ _id: { $in: personIds }, tripId });

        if (!participants.length) {
            return res.status(404).json({ message: "No matching participants found" });
        }

        const sent = [];

        for (const person of participants) {
            const viewLink = `${process.env.VIEW_PAGE_URL}/view/${person._id}?trip=${tripId}`;

            const individualCount = person.selfPhotos?.length || 0;
            const groupCount = person.alongWithSomeonePhotos?.length || 0;
            const totalCount = individualCount + groupCount;

            const message = `
Hey ${person.name}! 👋

Your trip memories from *${trip.tripName}* on *${new Date(trip.date).toDateString()}* are ready 📸

🧍 Solo Photos: ${individualCount}
👥 Group Photos: ${groupCount}
📸 Total: ${totalCount}

👇 Tap to view & download:
${viewLink}

Enjoy and relive the moments with FaceShare 💖
`.trim();

            const phone = person.phone.startsWith('+') ? person.phone : `+91${person.phone}`;
            const chatId = phone.replace('+', '') + '@c.us';

            await waBot.sendMessage(chatId, message);
            sent.push({ name: person.name, phone });
        }

        res.status(200).json({ message: "Messages sent successfully", sent });
    } catch (error) {
        console.error("❌ Error sending messages:", error.message);
        res.status(500).json({ message: "Failed to send messages" });
    }
};

exports.viewParticipantPhotos = async (req, res) => {
    try {
        const { personId } = req.params;
        const { tripId } = req.query;

        if (!personId || !tripId) {
            return res.status(400).json({ message: "personId and tripId are required" });
        }

        const person = await Person.findOne({ _id: personId, tripId });
        const trip = await Trip.findById(tripId);


        if (!person) {
            return res.status(404).json({ message: "Participant not found" });
        } const mapToUrl = (photoPath) => {
            const uploadsIndex = photoPath.indexOf('uploads');

            // If "uploads" exists in the path, slice from there
            if (uploadsIndex !== -1) {
                const relativePath = photoPath.slice(uploadsIndex).replace(/\\/g, '/');
                return `http://192.168.1.40:5000/${relativePath}`;
            }

            // Fallback: just return original (converted slashes)
            return `http://192.168.1.40:5000/${photoPath.replace(/\\/g, '/')}`;
        };

        res.status(200).json({
            name: person.name,
            tripName: trip.tripName,
            tripId,
            selfPhotos: (person.selfPhotos || []).map(mapToUrl),
            groupPhotos: (person.alongWithSomeonePhotos || []).map(mapToUrl),
        });
    } catch (error) {
        console.error("❌ Error fetching participant photos:", error.message);
        res.status(500).json({ message: "Failed to fetch photos" });
    }
};

