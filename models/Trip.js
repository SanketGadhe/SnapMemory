const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  tripName: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
  },
  noOfPerson: {
    type: Number
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  }],
  tripEmbedding: {
    type: String,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);
