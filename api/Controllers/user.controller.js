// user.controllers.js

import Conversation from "../../Models/chat.model.js";
import axios from "axios";
import { parseString } from "xml2js";
import { promisify } from "util";
import { sendWhatsAppMessage, sendSMSMessage } from "../../Services/twilio.service.js";
import {
  generateAccountSASQueryParameters,
  AccountSASPermissions,
  AccountSASServices,
  AccountSASResourceTypes,
  StorageSharedKeyCredential,
  SASProtocol,
} from "@azure/storage-blob";
const parseXml = promisify(parseString);

export const listofUsers = async (req, res) => {
  try {
    // SOAP request configuration
    const url = "https://uat.imsolutionsremote.co.uk/IMS/imswebservice.asmx";
    const headers = {
      SOAPAction: "http://IMS/WebService/CallStoredProcedure",
      "Content-Type": "text/xml; charset=utf-8",
    };
    const data = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://IMS/WebService">
               <soapenv:Header/>
               <soapenv:Body>
                  <web:CallStoredProcedure/>
               </soapenv:Body>
            </soapenv:Envelope>
        `;

    // Make the SOAP request
    const response = await axios.post(url, data, { headers });

    // Parse the XML response
    const result = await parseXml(response.data);

    // Extract the CaseData array
    const caseDataArray =
      result["soap:Envelope"]["soap:Body"][0]["CallStoredProcedureResponse"][0][
      "CallStoredProcedureResult"
      ][0]["CaseData"];

    // Format the data as required
    const formattedData = caseDataArray.map((caseData) => ({
      name: caseData.Name[0],
      phoneNumber: caseData.PhoneNumber[0],
      caseId: caseData.CaseId[0],
    }));

    // Send the formatted data as JSON response
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching case data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching case data" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message, type } = req.body;
    const contentToSend = message.content || null;
    const contentLinkToSend = message.content_link || null;
    let response;
    if (type === 'whatsapp') {
      response = await sendWhatsAppMessage(
        message.receiver_id,
        contentToSend,
        contentLinkToSend
      );
    }
    else {
      response = await sendSMSMessage(
        message.receiver_id,
        contentToSend,
        contentLinkToSend
      );
    }
    let data = await Conversation.findOne({ participant: message.receiver_id });
    if (!data) {
      data = new Conversation({
        participant: message.receiver_id,
        messages: [],
        sms: [],
      });
      console.log("new Convo created");
    }
    message["messageSid"] = response.messageSid;
    message["accountSid"] = response.accountSid;
    if (type === 'whatsapp') {
      data.messages.push(message);
    }
    else {
      data.sms.push(message);
    }
    await data.save();
    console.log("Data saved in mongo successfully");
    res.status(200).json({
      message: `Sending message to twilio successful , SID : ${response}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getChatbyNumber = async (req, res) => {
  try {
    console.log('GettingChat..');
    const { number, page = 1, limit = 20, type } = req.body; // page and limit for pagination
    const skip = (page - 1) * limit; // calculate the number of documents to skip

    const data = await Conversation.findOne({ participant: number });
    let response = { messages: [], hasMore: false };

    if (data) {
      let totalMessages;
      if (type === 'whatsapp') {
        totalMessages = data.messages.length;
        response.messages = data.messages
          .slice()
          .reverse()
          .slice(skip, skip + limit); // reverse and paginate
      }
      else {
        totalMessages = data.sms.length;
        response.messages = data.sms
          .slice()
          .reverse()
          .slice(skip, skip + limit); // reverse and paginate
      }
      response.hasMore = skip + limit < totalMessages; // check if there are more messages to load
    }

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getUnreadcount = async (req, res) => {
  try {
    const service = req.query.service;
    const conversations = await Conversation.find({});
    const unreadCountsArray = conversations.map(conv => ({
      phone: conv.participant,
      unreadCount: service === 'sms' ? conv.unreadSms : conv.unreadCount,
    }));

    res.status(200).json(unreadCountsArray);
  } catch (error) {
    console.error('Error fetching unread counts:', error);
    res.status(500).json({ message: 'Error fetching unread counts' });
  }

}

export const generateSasurl = async (req, res) => {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

  try {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );

    const startTime = new Date(new Date().valueOf() - 5 * 60 * 1000);
    const expiryTime = new Date(new Date().valueOf() + 60 * 60 * 1000); // 60 minutes from now

    const sasOptions = {
      services: AccountSASServices.parse("btqf").toString(), // blobs, tables, queues, files
      resourceTypes: AccountSASResourceTypes.parse("sco").toString(), // service, container, object
      permissions: AccountSASPermissions.parse("rwcal").toString(), // read, write, create, add, list
      protocol: SASProtocol.HttpsAndHttp,
      startsOn: startTime,
      expiresOn: expiryTime,
    };

    const sasToken = generateAccountSASQueryParameters(
      sasOptions,
      sharedKeyCredential
    ).toString();
    const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}?${sasToken}`;
    // Send the SAS Url to the client
    res.status(200).json(sasUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
