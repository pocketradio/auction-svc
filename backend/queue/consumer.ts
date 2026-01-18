import { rabbit } from "./client.js";
import { client, sha1 } from "../redis/client.js";
import updateBid from "../services/bid.service.js";

type bidMessage = {
    auctionId: number,
    userId: number,
    email: string,
    amount: number,
    timestamp: Date
};

type auctionMessage = {
    auctionId: number,
    userId: number,
    timestamp: Date,
}


export const sub = rabbit.createConsumer({
    queue: 'bid_workers',
    queueOptions: { durable: true },
    exchanges: [{ exchange: 'bid', type: 'direct' }],
    qos: { prefetchCount: 1 },
    queueBindings: [{
        exchange: 'bid', routingKey: 'bid.created'
    }, {
        exchange: 'bid', routingKey: 'auction.created'
    }]

}, async (msg) => {

    if (msg.routingKey === 'bid.created') {

        console.log("received bid ", msg.body);
        const { auctionId, userId, email, amount, timestamp } = msg.body as bidMessage;

        const result = await client.evalSha(sha1, {
            keys: [`auction:${auctionId}:currentBid`],
            arguments: [String(userId), email, String(amount), String(timestamp)]
        })


        // client , and not subclient is used here because subclient is for listening only ( once the subscribing starts ).
        // client -> handles publishing ( talking ) , subClient -> listening for updates to send to SSE. 

        if (result === 1) {
            try {
                await updateBid(auctionId, amount, userId);
            }
            catch (e) {
                throw new Error("Failed to update database.");
            }
            await client.publish("AUCTION_UPDATES", JSON.stringify({
                type: "BID_CREATED",
                auctionId,
                amount,
                userId
                //handle with res.success = true
                // no need userID since response 1 handles a toast in clientside. 
            }))
        }

        else if (result === -1) {
            await client.publish("AUCTION_UPDATES", JSON.stringify({
                type: "BID_REJECTED",
                auctionId,
                userId
                // handle with res.success = False
            }))
        }
    }

    else if (msg.routingKey === 'auction.created') {
        // directly sent to redis with AUCTION_CREATED
        const { auctionId, userId, timestamp } = msg.body as auctionMessage;
        await client.publish("AUCTION_UPDATES", JSON.stringify({
            type: "AUCTION_CREATED",
            auctionId,
            timestamp,
            userId
        }))
    }

})

sub.on('error', (err) => {
    console.log('consumer error', err);
})