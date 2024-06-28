import express from "express";
import cors from "cors";
import connectDB from "./Config/databaseConnection.js";
import userRoute from "./api/Routes/user.route.js";
import { Server } from "socket.io";
import http from "http";
import { queueService } from "./Services/queue.service.js";
import Conversation from "./Models/chat.model.js";
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", userRoute);

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust as necessary for your CORS policy
    methods: ["GET", "POST"],
  },
});

let connectedSockets = [];
let currentUser = null;

io.on("connection", (socket) => {
  const Userid = socket.handshake.auth.userid;
  if (!connectedSockets.find((soc) => soc.Userid === Userid)) {
    console.log("A user connected", Userid);

    connectedSockets.push({
      socketId: socket.id,
      Userid,
    });
  }
  // Handle socket events here
  socket.on('updateReadcount', async ({ count, activeService }) => {
    const data = await Conversation.findOne({ participant: count });
    if (data) {
      if (activeService === 'sms') {
        data.unreadSms = 0;
      }
      else {
        data.unreadCount = 0;

      }
      await data.save();
    }

  })
  socket.on('changeUser', (user) => {
    currentUser = user;
  })
  socket.on("disconnect", () => {
    connectedSockets = connectedSockets.filter(
      (soc) => soc.socketId !== socket.id
    );
    console.log("A user disconnected");
  });
});

// Export the io instance if needed in other modules
export { io };

queueService.addMessageHandler(async (messageData) => {
  console.log("Processing message:", messageData);
  let from, to;
  // For New service modify the sender and receiver here.
  if (messageData.type === 'sms') {
    from = messageData.from.slice(1);
    to = messageData.to.slice(1);
  }
  else {
    from = messageData.from.slice(10);
    to = messageData.to.slice(10);
  }
  let unreadmsg = null;
  try {
    let data = await Conversation.findOne({ participant: from });
    if (!data) {
      data = new Conversation({
        participant: from,
        messages: [],
        sms: [],
        unreadCount: 0,
        unreadSms: 0
      });
      console.log("new Convo created Reciever side...");
    }
    // Add your message processing logic here
    let timestamp = new Date(messageData.timestamp);
    const mongodbTimestamp = timestamp.toISOString().replace("Z", "+00:00");

    let contentType = "text";
    let contentLink = null;


    if (messageData.mediaItems && messageData.mediaItems.length > 0) {
      contentType = messageData.mediaItems[0].contentType;
      contentLink = messageData.mediaItems[0].url;
    }

    const newMessage = {
      sender_id: from,
      receiver_id: to,
      content: messageData.message,
      messageSid: messageData.messageSid,
      accountSid: messageData.accountSid,
      content_type: contentType,
      content_link: contentLink,
      timestamp: mongodbTimestamp,
      is_read: false,
    };
    if (messageData.type === 'sms') {
      if (currentUser !== null && currentUser.phoneNumber !== from) {
        data.unreadSms += 1;
      }
      if (currentUser === null) {
        data.unreadSms += 1;
      }
    }
    else {
      if (currentUser !== null && currentUser.phoneNumber !== from) {
        data.unreadCount += 1;
      }
      if (currentUser === null) {
        data.unreadCount += 1;
      }
    }
    unreadmsg = messageData.type === 'sms' ? data.unreadSms : data.unreadCount;
    if (messageData.type === 'sms') {
      data.sms.push(newMessage);
    }
    else {
      data.messages.push(newMessage);
    }
    await data.save();
    console.log("successfully saved message on reciever side..");
    console.log(
      "Processed message in our message model:",
      JSON.stringify(newMessage, null, 2)
    );

    const SOCKET = connectedSockets.find((soc) => soc.Userid === to);
    if (currentUser !== null && from === currentUser.phoneNumber) {
      io.to(SOCKET.socketId).emit("receiveMessage", newMessage);
    }
    io.to(SOCKET.socketId).emit("unreadMessages", { newMessage, unreadmsg });
  } catch (error) {
    console.log("Error in storing message in reciever side", error.message);
  }
});

// Start listening for messages when the app starts
queueService.startListening().catch(console.error);


// Graceful shutdown
process.on("SIGINT", async () => {
  await queueService.stopListening();
  process.exit(0);
});

// Start the server
const PORT = process.env.WEBSITES_PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
