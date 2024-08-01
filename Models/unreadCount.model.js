import mongoose from "mongoose";
const { Schema } = mongoose;

const ClientSchema = new Schema({
    senderId: String,
    unreadCount: { type: Number, default: 0 }
});

const ServiceSchema = new Schema({
    whatsapp: [ClientSchema],
    sms: [ClientSchema],
    mail: [ClientSchema],
    timeline : [ClientSchema]
});

const UnreadCountSchema = new Schema({
    userId: { type: String, unique: true },
    services: ServiceSchema
});

const UnreadCount = mongoose.model('UnreadCount', UnreadCountSchema);
export default UnreadCount;