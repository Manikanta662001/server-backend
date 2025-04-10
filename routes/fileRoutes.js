const express = require("express");
const { getFile, uploadFile } = require("../controllers/file.js");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.post("/", upload.single("picture"), uploadFile);
router.get("/:id", getFile);

module.exports = router;
