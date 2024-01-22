const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); //for password hashing



//Middleware used to parse incoming JSON data
app.use(express.json());
// Middleware used to parse URL-encoded data
app.use(express.urlencoded({extended:true}))
//used to access data from one domain(url) to another domain
app.use(cors());

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
      pass: "eehf vqhz nuss kdvr", // Your email password or app-specific password
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
    const { password,email } = req.body;

    let total_items = { ...req.body };
    let hashed_password = await bcrypt.hash(password, 10);
    total_items = { ...total_items, password: hashed_password };
    const dbresponse = await Registermodel.create(total_items)
      .then((dt) => dt)
      .catch((err) => err)
      .finally(() => mongoose.connection.close());
    console.log(dbresponse, "DBRESPONSE");
    res.status(200).json(dbresponse);

    // Email content and details
    const mailOptions = {
        from: 'gundlurimanikanta142@gmail.com', // Your email address
        to: email, // Recipient's email address
        subject: 'Registration', // Email subject
        text: 'registration is successful', // Email text content
    };
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    
  } catch (error) {
    console.log(error);
  }
});

// login post call
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(req.body, "LoginDATA");
    const user = await Registermodel.findOne({ email });
    console.log(user, "5353");
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(passwordMatch, "5757");
    if (passwordMatch) {
      res.json({ message: "Login successful" });
      
    } else {
      res.status(500).json({ message: "Internal Server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

// getting data from db
app.get('/getdbdata',(req,res)=>{
  let db_data = Registermodel.find({})
  .then(users=>{
    console.log(users,"db data") 
    res.status(200).json(users)
  })
  .catch(err=>{
    console.error(err,"Error while getting data from db")
    res.json({message:err})
  })
  console.log(db_data,"118")

})

app.put("/putupdate/:id",async(req,res)=>{
  const id = req.params.id
  console.log(id,"126")
  // Validate if userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("Invalid ObjectId format");
    return res.status(400).send("Invalid ObjectId format");
  }
  try{
    let updated =await Registermodel.findByIdAndUpdate(id,req.body,{new:true})
    console.log(updated,"130")
    res.status(200).json(updated)
  }
  catch(err){
    console.log(err)
    res.status(500).json("Error when updating the user")

  }
})
app.delete("/delete/:id",async(req,res)=>{
  const id = req.params.id
  console.log(id,"145")
  // Validate if userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("Invalid ObjectId format");
    return res.status(400).send("Invalid ObjectId format");
  }
  try{
    let deleted =await Registermodel.findByIdAndDelete(id)
    console.log(deleted,"153")
    res.status(200).json(deleted)
  }
  catch(err){
    console.log(err)
    res.status(500).json("Error when deleting the user")

  }
})

app.listen(PORT, () => {
  console.log(`server is running in ${process.env.HOST}:${PORT}`);
});
