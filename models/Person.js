const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        required: true
    },
    tripName: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    faceUrl: {
        type: String,
        required: true
    },
    selfPhotos: [String],
    alongWithSomeonePhotos: [String],
}, { timestamps: true });

module.exports = mongoose.model("Person", personSchema);
