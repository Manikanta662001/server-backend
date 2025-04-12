const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");

//Middleware used to parse incoming JSON data
app.use(express.json());
// Middleware used to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: "*", // Allow only this origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  credentials: true, // Allow credentials (e.g., cookies, authorization headers)
};
//used to access data from one domain(url) to another domain
app.use(cors(corsOptions));

const PORT = process.env.PORT || 8000;

app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "@" + file.originalname);
  },
});
const upload = multer({ storage: storage });
// mongoose(library) is used to connect mongodb database.
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Mongodb is connected"))
  .catch((error) => console.log("Error while connecting your mongodb", error));

const { register } = require("./controllers/auth");
const { getUser } = require("./controllers/users");
const { verifyToken } = require("././middleware/verifyToken");

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);

/* ROUTES */
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const fileRoutes = require("./routes/fileRoutes");

app.get("/getUser", verifyToken, getUser);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/file", fileRoutes);

/* SERVER FOR CHATS */
const { Server } = require("socket.io");
const { Registermodel } = require("./models/Registermodel");
const { MessageModel } = require("./models/Messagemodel");
const http = require("http");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user is Connected", socket.id);
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
  });
  socket.on("leaveRoom", ({ roomId }) => {
    socket.leave(roomId);
  });
  socket.on("msgtyping", async ({ roomId, to }) => {
    io.to(roomId).emit("msgtyping", { roomId, to });
  });
  socket.on("msgnottyping", async ({ roomId, to }) => {
    io.to(roomId).emit("msgnottyping", { roomId, to });
  });
  socket.on("allmsgs", async ({ roomId }) => {
    const allMsgs = await MessageModel.findOne({ roomId });
    io.to(roomId).emit("getallmsgs", { messages: allMsgs?.messages ?? [] });
  });
  socket.on("clearMsgCount", async ({ roomId, userId, friendId }) => {
    const receipientUser = await Registermodel.findById(userId);
    if (receipientUser?.messageCount?.has(friendId)) {
      receipientUser.messageCount.delete(friendId);
      await receipientUser.save();

      io.emit("msgCount", {
        from: userId,
        receipientUser,
      });
    }
  });

  socket.on("updateLastSeen", async ({ selectedId, lastSeen }) => {
    const receipientUser = await Registermodel.findById(selectedId);
    receipientUser.lastSeen = lastSeen;
    await receipientUser.save();
    io.emit("updateLastSeen", {
      id: receipientUser._id,
      receipientUser: receipientUser,
    });
  });
  socket.on("changeStatus", async ({ userId, status }) => {
    const userObj = await Registermodel.findById(userId);
    userObj.status = status;
    const updatedUser = await userObj.save();
    io.emit("changeStatus", {
      updatedUser,
    });
  });

  socket.on(
    "sendRequest",
    async ({
      userId,
      userName,
      userImage,
      friendId,
      friendName,
      friendImage,
    }) => {
      const user = await Registermodel.findById(userId);
      const toUser = await Registermodel.findById(friendId);
      const isRequestExists = user.sendingRequests.get(friendId);
      if (isRequestExists) {
        user.sendingRequests.delete(friendId);
        toUser.pendingRequests.delete(userId);
      } else {
        const dateTime = new Date();
        user.sendingRequests.set(friendId, {
          name: friendName,
          dateTime,
          picturePath: friendImage,
        });
        toUser.pendingRequests.set(userId, {
          name: userName,
          dateTime,
          picturePath: userImage,
        });
      }
      const updatedUser = await user.save();
      const updatedToUser = await toUser.save();
      io.emit("receiveSendRequest", {
        updatedUser,
        updatedToUser,
      });
    }
  );

  socket.on("changeRequestStatus", async ({ type, userId, friendId }) => {
    const user = await Registermodel.findById(userId);
    const toUser = await Registermodel.findById(friendId);
    if (type === "accept") {
      user.friends.push(friendId);
      toUser.friends.push(userId);
    }
    user.pendingRequests.delete(friendId);
    toUser.sendingRequests.delete(friendId);
    const updatedUser = await user.save();
    const updatedToUser = await toUser.save();
    io.emit("receiveSendRequest", {
      updatedUser,
      updatedToUser,
    });
  });

  socket.on(
    "message",
    async ({ roomId, content, from, to, date, time, type, fileLink }) => {
      const singleMessage = {
        content,
        from,
        to,
        time,
        date,
        type,
      };
      if (type === "image" || type === "document")
        singleMessage.fileLink = fileLink;
      const roomPresent = await MessageModel.findOne({ roomId });
      if (roomPresent) {
        roomPresent.messages.push(singleMessage);
        const updated = await roomPresent.save();
      } else {
        const newMessage = await MessageModel({
          messages: singleMessage,
          roomId,
        });
        await newMessage.save();
      }
      //to send message to a particular roomId
      io.to(roomId).emit("message", singleMessage);
      const activeRoom = io.sockets.adapter.rooms.get(roomId);
      if (!activeRoom || activeRoom.size < 2) {
        const receipientUser = await Registermodel.findById(to.id);
        const currentCount = receipientUser.messageCount.get(from.id) || 0;
        receipientUser.messageCount.set(from.id, currentCount + 1);
        const updated = await receipientUser.save();
        io.emit("msgCount", {
          from: to.id,
          receipientUser: updated,
        });
      }
      //change the Friends array of Registermodel
      const currentUser = await Registermodel.findById(from.id);
      const clonedObj = [...currentUser.friends];
      const selectedUserIndex = clonedObj.findIndex((id) => id === to.id);
      if (selectedUserIndex !== 0) {
        const friend = clonedObj.splice(selectedUserIndex, 1);
        clonedObj.unshift(friend[0]);
        currentUser.friends = clonedObj;
        await currentUser.save();
      }
    }
  );
});

server.listen(PORT, () => {
  console.log(`server is running in ${process.env.HOST}:${PORT}`);
});
