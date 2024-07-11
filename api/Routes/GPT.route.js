// GPT.router.js

import express from "express";
import {
    getRelevantInfo,
    getSummary,
    generateResponse,
} from "../Controllers/GPT.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-related operations
 */

/**
 * @swagger
 * /api/AI/getSummary:
 *   get:
 *     summary: Get summary of a conversation
 *     tags : [AI]
 *     parameters:
 *       - in: query
 *         name: convoID
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the conversation
 *     responses:
 *       200:
 *         description: A successful response
 */
router.get("/getSummary", getSummary);

/**
 * @swagger
 * /api/AI/getRelevantInfo:
 *   get:
 *     summary: Get relevant information from a conversation
 *     tags : [AI]
 *     parameters:
 *       - in: query
 *         name: convoID
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the conversation
 *     responses:
 *       200:
 *         description: A successful response
 */
router.get("/getRelevantInfo", getRelevantInfo);

/**
 * @swagger
 * /api/AI/generateResponse:
 *   post:
 *     summary: Generate a response for a given question
 *     tags : [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *     responses:
 *       200:
 *         description: A successful response
 */
router.post("/generateResponse", generateResponse);

export default router;

// import express from 'express';
// import { getRelevantInfo, getSummary , generateResponse } from '../Controllers/GPT.controller.js';

// const router = express.Router();

// router.get('/getSummary', getSummary);
// router.get('/getRelevantInfo' , getRelevantInfo);
// router.post('/generateResponse' , generateResponse);

// export default router;
