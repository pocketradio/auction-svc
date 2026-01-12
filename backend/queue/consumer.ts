import { rabbit } from "./client.js";
import { client, sha1 } from "../redis/client.js";
import updateBid from "../services/bid.service.js";

type consumerMessage = {
    auctionId: number,
    userId: number,
    email: string,
    amount: number,
    timestamp: Date
};

export const sub = rabbit.createConsumer({
    queue: 'bid_workers',
    queueOptions: { durable: true },
    exchanges: [{ exchange: 'bid', type: 'direct' }],
    qos: { prefetchCount: 1 },
    queueBindings: [{ exchange: 'bid', routingKey: 'bid.created' }]
}, async (msg) => {

    console.log("received bid ", msg.body);

    const { auctionId, userId, email, amount, timestamp } = msg.body as consumerMessage;

    //redis pipeline
    const result = await client.evalSha(sha1, {
        keys: [`auction:${auctionId}:currentBid`],
        arguments: [String(userId), email, String(amount), String(timestamp)]
    })

    if (result === 1) {
        try {
            await updateBid(auctionId, amount, userId);
        }
        catch (e) {
            throw new Error("Failed to update database.");
        }

        // stream success / bid created.
    }

    else if (result === -1) {
        // lost bid SSE / bid failed.
    }
})

sub.on('error', (err) => {
    console.log('consumer error', err);
})