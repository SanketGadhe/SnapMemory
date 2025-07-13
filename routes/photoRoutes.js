const express = require("express");
const router = express.Router();
const photoController = require("../controllers/photoController");
const upload = require("../middleware/uploadMiddleware");
const groupUpload = require("../middleware/groupPhotoUpload");
router.post("/selfie-detect", upload.single("file"), photoController.detectFaces);

router.post("/classify", groupUpload.array("images"), photoController.classifyPhotos);
module.exports = router;
