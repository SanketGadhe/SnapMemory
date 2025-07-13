const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");

router.post("/create", tripController.createTrip);
router.get("/summary", tripController.getTripSummary);
router.get("/all", tripController.getAllTrips);
router.post('/save-token', tripController.saveToken);
module.exports = router;
