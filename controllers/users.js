const { Registermodel } = require("../models/Registermodel");
const { STATUS_TYPES } = require("../utils/constants.js");

const getUser = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await Registermodel.findById(id);
    return res.status(STATUS_TYPES.OK).json(user);
  } catch (error) {
    return res.status(STATUS_TYPES.NOT_FOUND).json({ error: error.message });
  }
};

const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Registermodel.findById(id);
    const allfriends = await Promise.all(
      user.friends.map((id) => Registermodel.findById(id))
    );
    const formatedFriends = allfriends.map(
      ({
        _id,
        firstName,
        lastName,
        email,
        occupation,
        location,
        picturePath,
        messageCount,
        lastSeen,
        friends,
        status,
      }) => {
        return {
          _id,
          firstName,
          lastName,
          email,
          occupation,
          location,
          picturePath,
          messageCount,
          lastSeen,
          friends,
          status,
        };
      }
    );
    return res.status(STATUS_TYPES.OK).json(formatedFriends);
  } catch (error) {
    return res.status(STATUS_TYPES.NOT_FOUND).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Registermodel.find();
    return res.status(STATUS_TYPES.OK).json({ allUsers: users });
  } catch (error) {
    return res.status(STATUS_TYPES.NOT_FOUND).json({ error: error.message });
  }
};
module.exports = { getUserFriends, getUser, getAllUsers };
