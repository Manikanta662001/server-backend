const express = require("express");
const { verifyToken } = require("../middleware/verifyToken.js");

const { getUserFriends } = require("../controllers/users.js");
const router = express.Router();

/* READ */
router.get("/:id/friends", verifyToken, getUserFriends);

module.exports = router;
