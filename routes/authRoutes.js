const express = require("express");
const {
  forgotPwd1,
  forgotPwd2,
  forgotPwd3,
  login,
} = require("../controllers/auth.js");

const router = express.Router();

router.post("/login", login);
router.post("/forgotpassword1", forgotPwd1);
router.post("/forgotpassword2", forgotPwd2);
router.post("/forgotpassword3", forgotPwd3);

module.exports = router;
