const { STATUS_TYPES } = require("../utils/constants");
const { FileModel } = require("../models/Filemodel");

const uploadFile = async (req, res) => {
  try {
    const { originalname, buffer, size, mimetype } = req.file;
    const newFile = new FileModel({
      fileName: originalname,
      data: buffer,
      size,
      type: mimetype,
    });
    await newFile.save();
    return res.status(STATUS_TYPES.CREATED).json(newFile);
  } catch (error) {
    return res.status(STATUS_TYPES.BAD_REQUEST).json({ error: error.message });
  }
};

const getFile = async (req, res) => {
  try {
    const { id } = req.params;
    const dbImage = await FileModel.findById(id);
    res.status(STATUS_TYPES.OK).json(dbImage);
  } catch (error) {
    return res.status(STATUS_TYPES.BAD_REQUEST).json({ error: error.message });
  }
};

module.exports = { uploadFile, getFile };
