const mongoose = require('mongoose');

const ExpoToken = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ExpoToken', ExpoToken);
