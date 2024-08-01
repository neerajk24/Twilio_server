import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema({
  sender_id: { type: String, required: true },
  receiver_id: { type: String, required: true },
  content: { type: String, default: null },
  subject: { type: String, default: null },
  content_type: {
    type: String,
    enum: [
      "text",
      "file",
      "image/jpeg",
      "image/png",
      "video/mp4",
      "audio/mpeg",
      "application/pdf",
    ],
    required: true,
  },
  content_link: { type: String, default: null },
  messageSid: { type: String, default: null },
  accountSid: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
  is_read: { type: Boolean, default: false },
  VendorDetails: {
    name: { type: String, required: true },
    userID: { type: String, required: true }
  },
});

const conversationSchema = new Schema({
  participant: { type: String, required: true },
  unreadCount: { type: Number, default: 0 }, //Whatsapp unreadCount
  unreadSms: { type: Number, default: 0 }, // Sms unreadCount
  unreadMails: { type: Number, default: 0 }, // Mail unreadCount
  messages: [messageSchema],
  sms: [messageSchema],
  mails: [messageSchema],
  timeline: [messageSchema],
  unreadTimeline: { type: Number, default: 0 }
  // timeline array
  // unreadCount timeline
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
