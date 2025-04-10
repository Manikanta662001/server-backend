const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { STATUS_TYPES } = require("../utils/constants.js");

dotenv.config();
const verifyToken = (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    if (!token || token === "Bearer")
      return res
        .status(STATUS_TYPES.FORBIDDEN)
        .json({ error: "Token Not Found" });
    if (token.startsWith("Bearer ")) {
      token = token.replace("Bearer ", "");
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (!user) {
      return res
        .status(STATUS_TYPES.FORBIDDEN)
        .json({ error: "Invalid Token" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(STATUS_TYPES.SERVER_ERROR).json({ error: error.message });
  }
};
module.exports = { verifyToken };
