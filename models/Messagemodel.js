const mongoose = require("mongoose");

const messageSubSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  from: {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  to: {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  time: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  fileLink: String,
});

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  messages: {
    type: [messageSubSchema],
    required: true,
  },
});
const MessageModel = new mongoose.model("MessagesDb", messageSchema);
module.exports = { MessageModel };
