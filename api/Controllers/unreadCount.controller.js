import UnreadCount from "../../Models/unreadCount.model.js";

const unreadCountStore = new Map();

export const loadUnreadCounts = async () => {
    try {
        const allUnreadCounts = await UnreadCount.find({});
        allUnreadCounts.forEach(uc => {
            unreadCountStore.set(uc.userId, uc.toObject());
        });
        console.log('Unread counts loaded into memory');
    } catch (error) {
        console.error('Error loading unread counts:', error);
    }
};

export const updateUnreadCount = (userId, senderId, serviceType) => {
    let userCount = unreadCountStore.get(userId);
    if (!userCount) {
        userCount = { userId, services: { whatsapp: [], sms: [], mail: [], timeline: [] } };
        unreadCountStore.set(userId, userCount);
    }
    const serviceClients = userCount.services[serviceType];
    const clientIndex = serviceClients.findIndex(client => client.senderId === senderId);

    if (clientIndex === -1) {
        serviceClients.push({ senderId, unreadCount: 1 });
    } else {
        serviceClients[clientIndex].unreadCount++;
    }
    console.log(serviceClients);
    return serviceClients;
};

export const getUnreadCount = (userId, service) => {
    // console.log(`Userid : ${userId} and service : ${service}`);
    console.log(unreadCountStore);
    const user = unreadCountStore.get(userId)
    if (user) {
        return user.services[service]
    }
    return [];
};

export const markAsRead = (userId, senderId, serviceType) => {
    const userCount = unreadCountStore.get(userId);
    console.log(userCount);
    if (userCount) {
        const serviceClients = userCount.services[serviceType];
        console.log(serviceClients);
        const clientIndex = serviceClients.findIndex(client => client.senderId === senderId);
        console.log(clientIndex);
        if (clientIndex !== -1) {
            serviceClients.splice(clientIndex, 1); // Remove the record
        }
        console.log("New Service Clients : ", serviceClients);
        return true;
    }
    return false;
};


export const saveUnreadCount = async (userId) => {
    const userCount = unreadCountStore.get(userId);
    if (userCount) {
        try {
            await UnreadCount.findOneAndUpdate({ userId }, userCount, { upsert: true });
            console.log(`Unread count for user ${userId} saved to database`);
            return true;
        } catch (error) {
            console.error(`Failed to save unread count for user ${userId}:`, error);
            return false;
        }
    }
    return false;
};

export const syncAllUnreadCounts = async () => {
    for (const [userId, unreadCount] of unreadCountStore.entries()) {
        try {
            await UnreadCount.findOneAndUpdate({ userId }, unreadCount, { upsert: true });
        } catch (error) {
            console.error(`Failed to sync unread count for user ${userId}:`, error);
        }
    }
    console.log('Synced all unread counts to database');
};