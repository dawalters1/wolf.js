export default async (client, body) => {
    const oldBalance = client.store._balance;
    client.store._balance = body.balance;
    return await client.emit(Event.SUBSCRIBER_BLOCK_ADD, oldBalance >= 0 ? oldBalance : 0, body.balance);
};
