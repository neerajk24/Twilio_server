// user.routes.js

import express from "express";
import {
    listofUsers,
    sendMessage,
    getChatbyNumber,
    getUnreadcount,
    generateSasurl,
} from "../Controllers/user.controller.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - sender_id
 *         - receiver_id
 *         - content_type
 *       properties:
 *         sender_id:
 *           type: string
 *         receiver_id:
 *           type: string
 *         content:
 *           type: string
 *           nullable: true
 *         subject:
 *           type: string
 *           nullable: true
 *         content_type:
 *           type: string
 *           enum: [text, file, image/jpeg, image/png, video/mp4, audio/mpeg, application/pdf]
 *         content_link:
 *           type: string
 *           nullable: true
 *         messageSid:
 *           type: string
 *           nullable: true
 *         accountSid:
 *           type: string
 *           nullable: true
 *         timestamp:
 *           type: string
 *           format: date-time
 *         is_read:
 *           type: boolean
 *           default: false
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and messaging operations
 */


/**
 * @swagger
 * /api/user/listofUsers:
 *   get:
 *     summary: Get list of users
 *     tags : [User]
 *     responses:
 *       200:
 *         description: A successful response
 */
router.get("/listofUsers", listofUsers);

/**
 * @swagger
 * /api/user/sendMessage:
 *   post:
 *     summary: Send a message
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - type
 *               - phone
 *             properties:
 *               message:
 *                 $ref: '#/components/schemas/Message'
 *               type:
 *                 type: string
 *                 description: Active service type
 *               phone:
 *                 type: string
 *                 description: Phone number of the current user
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/sendMessage", sendMessage);

/**
 * @swagger
 * /api/user/getchatbyNumber:
 *   post:
 *     summary: Get previous messages by number or email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - page
 *               - limit
 *               - type
 *             properties:
 *               number:
 *                 type: string
 *                 description: Phone number or email of the user
 *               page:
 *                 type: integer
 *                 description: Page number for pagination
 *               limit:
 *                 type: integer
 *                 description: Number of messages per page
 *               type:
 *                 type: string
 *                 description: Type of service (e.g., 'mail' or 'sms')
 *     responses:
 *       200:
 *         description: Successfully retrieved chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       400:
 *         description: Bad request
 *       404:
 *         description: No messages found
 *       500:
 *         description: Internal server error
 */
router.post("/getchatbyNumber", getChatbyNumber);

/**
 * @swagger
 * /api/user/getUnreadcount:
 *   get:
 *     summary: Get unread message count
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *         required: false
 *         description: The service type for which to get the unread message count
 *     responses:
 *       200:
 *         description: A successful response
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get("/getUnreadcount", getUnreadcount);

/**
 * @swagger
 * /api/user/getSasurl:
 *   get:
 *     summary: Get a unique blob URL
 *     tags : [User]
 *     responses:
 *       200:
 *         description: A successful response
 */
router.get("/getSasurl", generateSasurl);

export default router;

// import express from 'express';
// import { listofUsers, sendMessage, getChatbyNumber, getUnreadcount, generateSasurl } from '../Controllers/user.controller.js';

// const router = express.Router();

// // Give the list of users
// router.get('/listofUsers', listofUsers);
// // Going to send a message to twilio
// router.post('/sendMessage', sendMessage);
// // Going to send previous messages as response
// router.post('/getchatbyNumber', getChatbyNumber);
// // Going to get message Unread Count
// router.get('/getUnreadcount', getUnreadcount);
// // Going to get a unique blob url
// router.get('/getSasurl', generateSasurl);
// export default router;