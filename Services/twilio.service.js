// File: twilioService.js

import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();
// Twilio configuration
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.ACCOUNT_AUTH;
const client = twilio(accountSid, authToken);

const twilioPhoneNumber = 'whatsapp:+14155238886';
const twilioSMSNumber = '+447380300545'

export const sendWhatsAppMessage = async (to, content, contentLink) => {
    console.log(`twilioPhone : ${twilioPhoneNumber} , to : ${to}`);
    console.log(accountSid, authToken);
    try {
        let messageOptions = {
            from: twilioPhoneNumber,
            to: `whatsapp:+${to}`,
            body: content,
        };

        if (contentLink) {
            messageOptions.mediaUrl = [contentLink];
        }

        const message = await client.messages.create(messageOptions);
        console.log(`Message sent successfully. SID: ${message.sid}`);
        return { messageSid: message.sid, accountSid: accountSid };
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};


export const sendSMSMessage = async (to, content, contentLink) => {
    console.log(`twilioPhone : ${twilioSMSNumber} , to : ${to}`);
    console.log(accountSid, authToken);
    try {
      let messageOptions = {
        from: twilioSMSNumber,
        to: `+${to}`,
        body: content,
      };
  
      if (contentLink) {
        messageOptions.mediaUrl = [contentLink];
      }
  
      const message = await client.messages.create(messageOptions);
      console.log(`Message sent successfully. SID: ${message.sid}`);
      return { messageSid: message.sid, accountSid: accountSid };
    } catch (error) {
      console.error("Error sending SMS message:", error);
      throw error;
    }
  };
  