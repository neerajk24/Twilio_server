import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { setupSocketHandlers } from "./Socket/socketHandlers.js";
import { initiateAuth } from "./api/Controllers/xero.controller.js";
import setupQueueService from "./Services/queueHandler.service.js";

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust as necessary for your CORS policy
        methods: ["GET", "POST"],
    },
});

// Setup socket handlers
setupSocketHandlers(io);

// Setup queue service
setupQueueService(io);

// Start the server
const PORT = process.env.WEBSITES_PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // initiateAuth();
});

// Export the io instance if needed in other modules
export { io };