// queueService.js
import { ServiceBusClient } from "@azure/service-bus";
import { log } from "console";
import dotenv from 'dotenv';

dotenv.config();
const connectionString = process.env.BUS_CONNECTION_URI;
const queueName = process.env.QUEUE_NAME;

class QueueService {
    constructor() {
        this.sbClient = new ServiceBusClient(connectionString);
        this.receiver = this.sbClient.createReceiver(queueName);
        this.messageHandlers = [];
    }

    addMessageHandler(handler) {
        this.messageHandlers.push(handler);
    }

    async startListening() {
        const messageHandler = async (message) => {
            console.log(`Received message: ${message.body}`);

            try {
                // Call all registered handlers
                for (const handler of this.messageHandlers) {
                    await handler(message.body);
                }

                // Complete the message
                await this.receiver.completeMessage(message);
            } catch (error) {
                console.error("Error processing message:", error);
                // You might want to implement some error handling logic here
            }
        };

        this.receiver.subscribe({
            processMessage: messageHandler,
            processError: async (err) => {
                console.error("Error from Azure Service Bus:", err);
            }
        });

        console.log("Started listening for messages");
    }

    async stopListening() {
        await this.receiver.close();
        await this.sbClient.close();
        console.log("Stopped listening for messages");
    }
}

export const queueService = new QueueService();