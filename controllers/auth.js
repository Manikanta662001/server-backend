const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { Registermodel } = require("../models/Registermodel");
const { STATUS_TYPES, generatedOtps } = require("../utils/constants.js");

/* Send Mail  */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gundlurimanikanta142@gmail.com",
    pass: "iucn ctzk xpvf grlw",
  },
});
dotenv.config();
/* REGISTER */
const register = async (req, res) => {
  try {
    const { filename } = req.file;
    let { user } = req.body;
    user = JSON.parse(user);

    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation
    } = user;
    const emailExist = await Registermodel.findOne({ email });
    if (emailExist) {
      return res
        .status(STATUS_TYPES.DUPLICATE_KEY)
        .json({ error: "Email alredy exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Registermodel({
      ...user,
      password: hashedPassword,
      picturePath: filename,
      messageCount: {},
      status: "Offline",
      lastSeen: new Date(),
    });
    const savedUser = await newUser.save();
    const mailOptions = {
      from: "gundlurimanikanta142@gmail.com",
      to: email,
      subject: "Social-Media Registration",
      html: `
      Hii <em>${user.firstName}</em>,
      <p>Your Registration Successful in <b>MK</b> Chat App</p>
      <br/>
      <h6>Thank You</h6>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(STATUS_TYPES.SERVER_ERROR).send(error.toString());
      }
      return res.status(STATUS_TYPES.CREATED).json({
        user: savedUser,
        message: "User Registered Successfully and Email Sent",
      });
    });
    res.status(STATUS_TYPES.CREATED).json({ message: "Registered Successfully" })
  } catch (error) {
    res.status(STATUS_TYPES.SERVER_ERROR).json({ error: error.message });
  }
};

/* LOGIN */

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Registermodel.findOne({ email });
    if (!user)
      return res
        .status(STATUS_TYPES.BAD_REQUEST)
        .json({ error: "User Not Found" });
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched)
      return res
        .status(STATUS_TYPES.BAD_REQUEST)
        .json({ error: "Invalid Credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    user.status = "Online";
    const updatedUser = await user.save();
    const mailOptions = {
      from: "gundlurimanikanta142@gmail.com",
      to: email,
      subject: "Social-Media Login",
      html: `
      Hii <em>${user.firstName}</em>,
      <p>Login Successful in <b>MK</b> Chat App.</p>
      <br/>
      <h6>Thank You.</h6>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(STATUS_TYPES.SERVER_ERROR).send(error.toString());
      }
      const userObject = updatedUser.toObject();
      //we don't need to send the pwd to frontend
      delete userObject.password;
      return res
        .status(STATUS_TYPES.OK)
        .json({ user: userObject, token, message: "Login Successful" });
    });
  } catch (error) {
    return res.status(STATUS_TYPES.SERVER_ERROR).json({ error: error.message });
  }
};

const forgotPwd1 = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Registermodel.findOne({ email });
    if (!user)
      return res
        .status(STATUS_TYPES.BAD_REQUEST)
        .json({ error: "User Not Found" });

    const randomOtp = Math.floor(Math.random() * 1000000).toString();
    generatedOtps[user._id] = randomOtp;
    const mailOptions = {
      from: "gundlurimanikanta142@gmail.com",
      to: email,
      subject: "Social-Media Forgot Password",
      html: `
      Hii <em>${user.firstName}</em>,
      <p>Your OTP is ${randomOtp}</p>
      <br/>
      <h6>Thank You</h6>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(STATUS_TYPES.SERVER_ERROR).send(error.toString());
      }
      return res
        .status(STATUS_TYPES.OK)
        .json({ message: "Otp Sent To Your Mail" });
    });
  } catch (error) {
    return res.status(STATUS_TYPES.SERVER_ERROR).json({ error: error.message });
  }
};
const forgotPwd2 = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await Registermodel.findOne({ email });
    if (!user)
      return res
        .status(STATUS_TYPES.BAD_REQUEST)
        .json({ error: "User Not Found" });
    if (generatedOtps[user._id] === otp) {
      return res.status(STATUS_TYPES.OK).json({ message: "OTP verified" });
    } else {
      return res
        .status(STATUS_TYPES.BAD_REQUEST)
        .json({ error: "Incorrect OTP" });
    }
  } catch (error) {
    return res.status(STATUS_TYPES.SERVER_ERROR).json({ error: error.message });
  }
};
const forgotPwd3 = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Registermodel.findOne({ email });
    if (!user)
      return res
        .status(STATUS_TYPES.BAD_REQUEST)
        .json({ error: "User Not Found" });
    const hashedPwd = await bcrypt.hash(password, 10);
    const updatedUser = await Registermodel.findOneAndUpdate(
      { email: email },
      { password: hashedPwd },
      { new: true, upsert: true }
    );
    return res
      .status(STATUS_TYPES.OK)
      .json({ message: "Password Updated Successfully" });
  } catch (error) {
    return res.status(STATUS_TYPES.SERVER_ERROR).json({ error: error.message });
  }
};

module.exports = { register, login, forgotPwd1, forgotPwd2, forgotPwd3 };
