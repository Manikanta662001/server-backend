const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); //for password hashing

//Middleware used to parse incoming JSON data
app.use(express.json());
// Middleware used to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: "http://localhost:8000", // Allow only this origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  credentials: true, // Allow credentials (e.g., cookies, authorization headers)
};
//used to access data from one domain(url) to another domain
app.use(cors(corsOptions));

const PORT = process.env.PORT || 8000;

// mongoose(library) is used to connect mongodb database.
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Mongodb is connected"))
  .catch((error) => console.log("Error while connecting your mongodb", error));

//getting data from mockData.js file
const { store } = require("./mockData");
// console.log(store)

//to send email
const nodemailer = require("nodemailer");
// Create a transporter with your email service provider's SMTP settings.
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service provider (e.g., 'Gmail', 'Outlook')
  auth: {
    user: "gundlurimanikanta142@gmail.com", // Your email address
    pass: "eseh ucdn joff iyco", // Your email password or app-specific password
  },
});

app.get("/carsget", (req, res) => {
  res.status(200).json(store);
});

//getting schema
const { Registermodel } = require("./models/Registermodel");

//register post call
app.post("/postuserdata", async (req, res) => {
  try {
    console.log(req.body, "REGISTERDATA");
    const { password, email } = req.body;
    let total_items = { ...req.body };
    let hashed_password = password?.length
      ? await bcrypt.hash(password, 10)
      : password;
    total_items = { ...total_items, password: hashed_password };
    const dbresponse = await Registermodel.create(total_items);
    console.log(dbresponse, "61DB");
    //sending response
    res.status(200).json(dbresponse);
    //mail sending
    const mailOptions = {
      from: "gundlurimanikanta142@gmail.com", // Your email address
      to: email, // Recipient's email address
      subject: "Registration", // Email subject
      text: "registration is successful", // Email text content
    };
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  } catch (error) {
    console.error("Error:", JSON.stringify(error.errors), error.message);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) =>
        err.message.replace("Path ", "")
      );
      return res.status(400).json({ error: errors });
    } else if (error.message.includes("email_1 dup key")) {
      return res.status(600).json({ error: "Email Already Exists" });
    } else {
      return res.status(400).json({ error: error.message });
    }
  }
});

// login post call
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(req.body, "LoginDATA");
    const user = await Registermodel.findOne({ email });
    console.log(Boolean(user), "5353");
    if (!user) {
      throw new Error("User not found");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(passwordMatch, "5757");
    if (passwordMatch) {
      // to set and send response headers to FE
      res.set("Api-Key", "dummy_api_key");
      res.json({ message: "Login successful", user });
    } else {
      throw new Error("Invalid Password");
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// getting data from db
app.get("/getdbdata", (req, res) => {
  let db_data = Registermodel.find({})
    .then((users) => {
      console.log(users, "db data");
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err, "Error while getting data from db");
      res.json({ message: err });
    });
});

app.put("/putupdate/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id, "126");
  try {
    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid ObjectId format");
      throw new Error("Invalid ObjectId format");
    }
    let updated = await Registermodel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    console.log(updated, "130");
    if (!updated) {
      throw new Error("Error when updating the user");
    }
    res.status(200).json(updated);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});
app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id, "145");
  try {
    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid ObjectId format");
      throw new Error("Invalid ObjectId format");
    }
    let deleted = await Registermodel.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Error when deleting the user");
    }
    res.status(200).json(deleted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// to test query params
app.get("/check_params", async (req, res) => {
  const { firstName, email } = req.query;
  console.log("PARAMS::::", firstName, email);
  try {
    if (!firstName || !email) {
      throw new Error("Firstname and Email are Required");
    }
    const valid_user = await Registermodel.findOne({ firstName, email });
    if (valid_user) {
      res.status(200).json({ message: "Valid User" });
    } else {
      throw new Error("Not a Valid User");
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`server is running in ${process.env.HOST}:${PORT}`);
});
