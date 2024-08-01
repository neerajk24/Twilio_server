import express from "express";
import { handleCallback, getContacts , updateAddress } from "../Controllers/xero.controller.js";
const router = express.Router();

router.get('/callback', handleCallback);
router.get('/contacts', getContacts);
router.post('/updateAddress', updateAddress);

export default router