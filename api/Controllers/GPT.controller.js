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
                content: "You are an AI assistant tasked with extraction of any relevant information like Email , passwords , links or any other confidential data shared in chat make sure to format it correctly."
            },
            {
                role: "user",
                content: `This is the chat :\n\n${formattedMessages}`
            }
        ];

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 100  // Adjust as needed
        });

        // console.log('Summary:', completion.choices[0].message.content);
        res.status(200).json({ Response: completion.choices[0].message.content });

    } catch (error) {
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