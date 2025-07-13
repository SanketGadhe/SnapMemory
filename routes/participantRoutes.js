const express = require("express");
const router = express.Router();
const participantController = require("../controllers/participantController");

router.post("/create", participantController.createParticipants);
router.get("/send-link", participantController.sendWhatsAppLinkDirectly);
router.get("/view-photos/:personId", participantController.viewParticipantPhotos);
router.post('/send-all', participantController.sendAllToWhatsApp);

module.exports = router;
