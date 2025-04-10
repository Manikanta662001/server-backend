const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  data: {
    type: Buffer,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  type: String,
});
const FileModel = new mongoose.model("File", fileSchema);
module.exports = { FileModel };
