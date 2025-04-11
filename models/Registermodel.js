const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 20,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    picturePath: {
      type: String,
      default: "",
    },
    friends: {
      type: Array,
      default: [],
    },
    pendingRequests: {
      type: Map,
      default: {},
    },
    messageCount: {
      type: Map,
      of: Number,
      default: {},
    },
    location: String,
    occupation: String,
    status: String,
    lastSeen: Date,
  },
  { timestamps: true }
);
module.exports.Registermodel = new mongoose.model("usersDataDB", userSchema);
