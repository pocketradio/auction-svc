import { createClient } from "redis";
import fs from 'fs';

export const client = createClient({
    url: process.env.REDIS_URL as string
});

await client.connect();

export const luascript = fs.readFileSync(new URL("./scripts/bid.lua", import.meta.url)) //
export const sha1 = await client.scriptLoad(luascript);