const express = require("express");
const { verifyToken } = require("../middleware/verifyToken.js");

const { getUserFriends, getAllUsers } = require("../controllers/users.js");
const router = express.Router();

/* READ */
router.get("/:id/friends", verifyToken, getUserFriends);
router.get("/getAllUsers", verifyToken, getAllUsers);

module.exports = router;
