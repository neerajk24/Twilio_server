import Conversation from "../../Models/chat.model.js";
import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();


const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

export const getSummary = async (req, res) => {
    try {
        const { convoID } = req.query;
        // Fetch the conversation from MongoDB
        const conversation = await Conversation.findOne({ participant: convoID });

        if (!conversation) {
            console.log('Conversation not found');
            return;
        }

        // Extract and format messages
        const formattedMessages = conversation.messages
            .filter(msg => msg.content_type === 'text') // Only include text messages
            .map(msg => `${msg.sender_id === conversation.participant ? 'User1' : 'User2'}: ${msg.content}`)
            .join('\n');

        // Prepare the prompt for OpenAI
        const messages = [
            {
                role: "system",
                content: "You are an AI assistant tasked with summarizing conversations. Provide a concise summary of the key points discussed."
            },
            {
                role: "user",
                content: `Please summarize the following conversation:\n\n${formattedMessages}`
            }
        ];

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 250  // Adjust as needed
        });

        // console.log('Summary:', completion.choices[0].message.content);
        res.status(200).json({ Response: completion.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getRelevantInfo = async (req, res) => {
    try {
        const { phoneNumber, messages } = req.body;

        // Extract and format messages (your existing code)
        const formattedMessages = messages
            .filter(msg => msg.content_type === 'text')
            .map(msg => {
                const date = new Date(msg.timestamp);
                const formattedTimestamp = date.toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Kolkata'
                });

                return `[${formattedTimestamp}] ${msg.sender_id === phoneNumber ? 'User' : 'Agent'}: ${msg.content}`;
            })
            .join('\n');

        console.log(formattedMessages);
        // Prepare the prompt for OpenAI with enhanced instructions
        const message = [
            {
                role: "system",
                content: `You are an AI assistant tasked with extracting the most recent address information from a chat conversation. The moment you read first address thats it save it. 
                Please format the address in the following structure:
                {
                    "AddressLine1": "",
                    "AddressLine2": "",
                    "City": "",
                    "Region": "",
                    "PostalCode": "",
                    "Country": ""
                }
                If any field is not found in the chat, leave it as an empty string. If no address information is found at all, return an empty object with all fields as empty strings. Remember, only return the most recent address based on the timestamp.`
            },
            {
                role: "user",
                content: `Extract the most recent address information from this chat, paying close attention to the timestamps:\n\n${formattedMessages}`
            }
        ];

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: message,
            max_tokens: 300  // Increased to allow for more detailed response
        });

        // Parse the response
        let addressData;
        try {
            addressData = JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error parsing GPT response:', error);
            addressData = {
                AddressLine1: "",
                AddressLine2: "",
                City: "",
                Region: "",
                PostalCode: "",
                Country: ""
            };
        }

        res.status(200).json(addressData);

    } catch (error) {
        console.error('Error in getRelevantInfo:', error);
        res.status(500).json({ error: error.message });
    }
}

export const generateResponse = async (req, res) => {
    try {
        const { question } = req.body;
        const messages = [
            {
                role: "system",
                content: "You are an AI assistant , You need to generate a logical formal response for the provided sentence."
            },
            {
                role: "user",
                content: `This is the sentence :\n\n${question}`
            }
        ];
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 100  // Adjust as needed
        });
        res.status(200).json({ Response: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ message: "Cannot generate Response", error: error.message });
    }
}