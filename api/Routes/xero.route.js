import express from "express";
import { handleCallback, getContacts , updateAddress , initiateAuth } from "../Controllers/xero.controller.js";
const router = express.Router();

router.get('/initauth' , initiateAuth);
router.get('/callback', handleCallback);
router.get('/contacts', getContacts);
router.post('/updateAddress', updateAddress);

export default router