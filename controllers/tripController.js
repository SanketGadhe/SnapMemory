const Person = require("../models/Person");
const Trip = require("../models/Trip");
const ExpoToken = require('../models/ExpoToken');

exports.createTrip = async (req, res) => {
  try {
    const { tripName, date, location } = req.body;

    if (!tripName || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingTrip = await Trip.findOne({ tripName });
    if (existingTrip) {
      return res.status(409).json({ message: "Trip with this name already exists" });
    }

    const newTrip = new Trip({ tripName, date, location });
    await newTrip.save();

    res.status(201).json({ message: "Trip created successfully", trip: newTrip });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTripSummary = async (req, res) => {
  try {
    const { tripId } = req.query;

    if (!tripId) {
      return res.status(400).json({ message: "tripId is required" });
    }

    const trip = await Trip.findById(tripId).populate("participants");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const participants = trip.participants.map(person => {
      const individualCount = person.selfPhotos?.length || 0;
      const groupCount = person.alongWithSomeonePhotos?.length || 0;

      return {
        _id: person._id,
        name: person.name,
        phone: person.phone,
        individualCount,
        groupCount,
        totalCount: individualCount + groupCount
      };
    });

    res.status(200).json({ participants });
  } catch (error) {
    console.error("❌ Error in getTripSummary:", error.message);
    res.status(500).json({ message: "Failed to fetch trip summary" });
  }
};


exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("participants", "name phone")
      .sort({ date: -1 });

    res.status(200).json({ trips });
  } catch (error) {
    console.error("❌ Error fetching trips:", error.message);
    res.status(500).json({ message: "Failed to fetch trips" });
  }
};


exports.saveToken = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    await ExpoToken.updateOne({ token }, { token }, { upsert: true });
    res.status(201).json({ message: 'Token saved successfully' });
  } catch (err) {
    console.error('Token save failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}