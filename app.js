import express from "express";
import cors from "cors";
import connectDB from "./Config/databaseConnection.js";
import userRoute from "./api/Routes/user.route.js";
import AIroute from "./api/Routes/GPT.route.js";
import xeroRoute from "./api/Routes/xero.route.js";
import setupSwagger from "./swaggerConfig.js";
import dotenv from "dotenv";
import { loadUnreadCounts } from "./api/Controllers/unreadCount.controller.js";

dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Setup Swagger
setupSwagger(app);

// Routes
app.use("/api/user", userRoute);
app.use("/api/AI", AIroute);
app.use("/api/xero", xeroRoute);

// Load the unreadCount of all the users as soon as Server starts
loadUnreadCounts();
export default app;