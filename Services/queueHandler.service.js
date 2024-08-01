import { queueService } from "./queue.service.js";
import Conversation from "../Models/chat.model.js";
import getPhoneNumber from "../utils/emailService.js";
import { updateUnreadCount } from "../api/Controllers/unreadCount.controller.js";
import { connectedSockets, connections, ListofUsers, Queue } from "../Socket/socketHandlers.js";

const setupQueueService = (io) => {
    queueService.addMessageHandler(async (messageData) => {
        console.log("Processing message:", messageData);
        let from, to, phone;
        // For New service modify the sender and receiver here.
        if (messageData.type === "sms") {
            from = messageData.from.slice(1);
            to = messageData.to.slice(1);
        } else if (messageData.type === "whatsapp") {
            from = messageData.from.slice(10);
            to = messageData.to.slice(10);
        } else {
            from = messageData.from;
            to = messageData.to;
            phone = getPhoneNumber(from, ListofUsers);
        }
        // Making a new conversation if the sender is new..
        try {
            let data = await Conversation.findOne({
                participant: messageData.type === "mail" ? phone : from,
            });
            if (!data) {
                data = new Conversation({
                    participant: messageData.type === "mail" ? phone : from,
                    messages: [],
                    sms: [],
                    mails: [],
                    timeline: [],
                    unreadCount: 0,
                    unreadSms: 0,
                    unreadMails: 0,
                });
                console.log("new Convo created Reciever side...");
            }
            // Add your message processing logic here
            let timestamp = new Date(messageData.timestamp);
            const mongodbTimestamp = timestamp.toISOString().replace("Z", "+00:00");

            let contentType = "text";
            let contentLink = null;

            // Handle media items here..
            if (messageData.mediaItems && messageData.mediaItems.length > 0) {
                contentType = messageData.mediaItems[0].contentType;
                contentLink = messageData.mediaItems[0].url;
            }
            // Checking whether the client is chatting with a Vendor or not
            const connect = connections.find((conn) => conn.client.phoneNumber === from || conn.client.Email === from);

            const newMessage = {
                sender_id: from,
                receiver_id: to,
                content: messageData.message,
                messageSid: messageData.messageSid,
                accountSid: messageData.accountSid || null,
                content_type: contentType,
                content_link: contentLink,
                timestamp: mongodbTimestamp,
                is_read: false,
                subject: messageData.subject,
                VendorDetails: connect ? connect.vendor : { name: "NA", userID: "NA" }
            };
            // save data according to the message type here..
            if (messageData.type === "sms") {
                data.sms.push(newMessage);
            } else if (messageData.type === "whatsapp") {
                data.messages.push(newMessage);
            } else {
                data.mails.push(newMessage);
            }
            data.timeline.push(newMessage);
            await data.save();
            console.log("successfully saved message on reciever side..");
            console.log(
                "Processed message in our message model:",
                JSON.stringify(newMessage, null, 2)
            );
            // Handle the socket logic for different services here ..
            if (!connect) {
                console.log("Connection not found");
                //Send user to queue
                Queue.push(newMessage.sender_id);
                // io.emit('queue', newMessage.sender_id);
                return;
            }
            const SOCKET = connectedSockets.find((soc) => soc.Userid === connect.vendor.userID);
            console.log(SOCKET);
            if (!SOCKET) {
                console.log("Socket not found");
                return;
            }
            // Send RecieveMessage if connection is there if the current User is not selected then unread count will be there
            io.to(SOCKET.socketId).emit("receiveMessage", newMessage);
            // Inside your message handler, after emitting the receiveMessage event
            // handle the unread count logic
            const unreadCount = updateUnreadCount(SOCKET.Userid, newMessage.sender_id, messageData.type);
            io.to(SOCKET.socketId).emit("unreadCount", unreadCount);
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
};

export default setupQueueService;