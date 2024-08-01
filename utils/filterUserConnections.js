export default function FilterUserConnections(connections, ListofUsers) {
    const updatedUsers = ListofUsers.map((user) => {
        const isConnected = connections.some(conn => conn.client.phoneNumber === user.phoneNumber);
        // console.log(`User ${user.name}, Phone: ${user.phoneNumber}, isConnected: ${isConnected}`);
        return {
            ...user,
            startChat: isConnected
        };
    });
    return updatedUsers;
}