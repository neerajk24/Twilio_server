import FilterUserConnections from "../utils/filterUserConnections.js";
import { markAsRead, getUnreadCount, saveUnreadCount } from "../api/Controllers/unreadCount.controller.js";

let connectedSockets = [];
let connections = [];
let ListofUsers = [];
let Queue = [];

const setupSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        handleNewConnection(socket, io);
        socket.on("updateReadcount", (data) => handleUpdateReadCount(data, socket));
        socket.on("NewUsers", (list) => handleNewUsers(list, io));
        socket.on("chatStarted", (response) => handleChatStarted(response, io));
        socket.on("chatEnded", (response) => handleChatEnded(response, io));
        // socket.on("removeQueue", (senderID) => handleQueueRemove(senderID, io));
        socket.on("disconnect", () => handleDisconnect(socket, io));
    });
};

const handleNewConnection = (socket, io) => {
    const Userid = socket.handshake.auth.userid;
    const username = socket.handshake.auth.name;
    const service = socket.handshake.auth.service;
    console.log(service);
    if (!connectedSockets.find((soc) => soc.Userid === Userid)) {
        console.log("A user connected", username);
        connectedSockets.push({
            socketId: socket.id,
            Userid,
            username,
            service
        });
    }
    // Emit the unreadCount to the frontend as soon as it connects to the backend.
    const Socket = connectedSockets.find((soc) => soc.socketId === socket.id);
    console.log(Socket);
    if (!Socket) {
        console.log("Undefined Service");
        return;
    }
    const unreadCount = getUnreadCount(Userid, Socket.service);
    console.log(unreadCount);
    socket.emit("initunreadCount", unreadCount);
    // socket.emit("queue", Queue);
    console.log("UnreadCount emitted");
};

const handleUpdateReadCount = (data, socket) => {
    const SOCKET = connectedSockets.find((soc) => soc.socketId === socket.id);
    let key = data.chat.phoneNumber;
    if (data.activeService === 'mail') {
        key = data.chat.Email;
    }
    const mark = markAsRead(SOCKET.Userid, key, data.activeService);
    if (mark) {
        console.log("MessageMarked as READ");
        return;
    }
    console.log("Message not marked as read");
};

const handleNewUsers = (list, io) => {
    if (list.length > ListofUsers.length) {
        ListofUsers = list;
    }
    io.emit('NewConnection', ListofUsers);
};

const handleChatStarted = (response, io) => {
    console.log(`Chat Started : ${response.client} , ${response.vendor}`);
    connections.push(response);
    const newListofuser = FilterUserConnections(connections, ListofUsers);
    ListofUsers = newListofuser;
    io.emit('NewConnection', ListofUsers);
    console.log(connections);
};

const handleChatEnded = (response, io) => {
    console.log(`Chat Ended : ${response.client} , ${response.vendor}`);
    connections = connections.filter(conn => conn.client.phoneNumber !== response.client.phoneNumber && conn.vendor !== response.vendor);
    const newListofuser = FilterUserConnections(connections, ListofUsers);
    ListofUsers = newListofuser;
    io.emit('NewConnection', ListofUsers);
};

// const handleQueueRemove = (senderID, io) => {
//     Queue = Queue.filter((number) => number !== senderID);
//     io.emit("queue", Queue);
// }

const handleDisconnect = (socket, io) => {
    const user = connectedSockets.find((soc) => soc.socketId === socket.id);
    if (!user) {
        console.log("No user is present for disconnections..");
        return;
    }
    const userConnections = connections.filter((conn) => conn.vendor.userID === user.Userid);

    // Update startChat for all relevant users
    userConnections.forEach((connection) => {
        const relevantUser = ListofUsers.find((client) => client.phoneNumber === connection.client.phoneNumber);
        if (relevantUser) {
            relevantUser.startChat = false;
        }
    });
    if (userConnections.length) {
        io.emit('NewConnection', ListofUsers);
    }
    connections = connections.filter((conn) => conn.vendor.userID !== user.Userid);
    connectedSockets = connectedSockets.filter(
        (soc) => soc.socketId !== socket.id
    );
    // Save UnreadCount for the user as soon as it gets disconnected
    saveUnreadCount(user.Userid);
    console.log("A user disconnected");
};

export { setupSocketHandlers, connectedSockets, connections, ListofUsers, Queue };