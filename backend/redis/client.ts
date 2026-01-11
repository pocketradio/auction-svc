import { createClient } from "redis";

export const client = createClient({
    url: process.env.REDIS_URL as string
});

await client.connect();