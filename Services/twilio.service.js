// File: twilioService.js

import twilio from 'twilio';
import dotenv from 'dotenv';
import sgMail from "@sendgrid/mail";


dotenv.config();
// Twilio configuration
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.ACCOUNT_AUTH;
const client = twilio(accountSid, authToken);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const twilioPhoneNumber = 'whatsapp:+14155238886';
const twilioSMSNumber = '+447380300545';
const twilioVendorEmail = "neeraj.kumar@catura.co.uk";

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

export const sendEmailMessage = async (
  to,
  content,
  subjectOfEmail,
  contentLinkToSend
) => {
  // Handle multiple line context or body
  const contentParagraphs = content
    .split("\n")
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");

  // Conditionally create the file section HTML
  const fileSectionHtml = contentLinkToSend ? `
    <br>
    <hr>
    <br>
    <div style="background-color: #f0f0f0; border: 1px solid #888; padding: 10px; margin: 10px; max-width: 400px;">
      <p>Media Link: <a href="${contentLinkToSend}">${contentLinkToSend}</a></p>
      <div style="display: flex; align-items: center;">
        <div style="margin-right: 10px;">
          <img src="${contentLinkToSend}" alt="Media Preview" style="max-width: 100px; height: auto;">
        </div>
        <div>
          <p style="margin-bottom: 5px;"><strong>File Name:</strong> ${extractFileName(contentLinkToSend)}</p>
          <p><a href="${contentLinkToSend}">View Media</a></p>
        </div>
      </div>
    </div>
  ` : '';

  const msg = {
    to,
    from: twilioVendorEmail,
    subject: subjectOfEmail || "Default Subject",
    text: content,
    html: `
    ${contentParagraphs}
    ${fileSectionHtml}
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Function to extract file name from contentLinkToSend URL
const extractFileName = (url) => {
  try {
    const fileNameWithExtension = url.split("/").pop(); // Get the last part after splitting by '/'
    const fileName = fileNameWithExtension.split("-").slice(1).join("-"); // Extract name part after the first number and dash
    return fileName;
  } catch (error) {
    console.error("Error extracting file name:", error);
    return "Unknown File Name";
  }
};
