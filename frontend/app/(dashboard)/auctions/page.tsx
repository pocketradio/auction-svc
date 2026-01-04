"use client"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

interface Auction {
    id: number
    title: string
    description: string | null
    startingBid: string
    currentBid: string
    isActive: boolean
    ownerId: number
    createdAt: string
    endsAt: string
    updatedAt: string
}


export default function Page() {

    const [auctions, setAuctions] = useState<Auction[]>([]);


    //useeffect for initial auction loading 
    useEffect(() => {
        fetch("http://localhost:5000/auctions")
            .then((response) => {
                if (response.status >= 400) {
                    throw new Error("Server error :( ");
                }
                return response.json();
            })
            .then((response) => setAuctions(response.auctions));
    }, [])


    // useeffect for persisting SSE
    useEffect(() => {
        const sse: EventSource = new EventSource("http://localhost:5000/streams");

        sse.addEventListener("message", (e) => {
            try {
                const parsedData = JSON.parse(e.data);

                if (parsedData.type === "auction_created") {
                    setAuctions(previousAuction => [...previousAuction, ...parsedData.auctions]);
                }

                else if (parsedData.type === "created_bid") {
                    setAuctions(auctions =>
                        auctions.map(x => x.id === parsedData.auction_id ? { ...x, currentBid: parsedData.current_bid } : x))
                } // replace just that current bid using fn state updates and return a new array to setState ( map does that bit )

                else if (parsedData.type === "auction_closed") {
                    setAuctions(auctions =>
                        auctions.filter(x => x.id !== parsedData.auction_id)
                    )
                };
            }
            catch (e) {
                console.error(e); // not throwing since inside an SSE.
            }
        })

        return () => {
            sse.close();
        }

    }, []);



    return (
        <>

            {
                auctions.map((e) => (
                    <Card key={e.id} className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle>{e.title}</CardTitle>
                            <CardDescription>
                                By user #{e.ownerId}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="text-sm space-y-1">
                            <div>Current bid: ₹{e.currentBid}</div>
                            <div>
                                Ends: {new Date(e.endsAt).toLocaleString()}
                            </div>
                        </CardContent>

                        <CardFooter className="flex-col gap-2">
                            <Button type="submit" className="w-full hover:bg-gray-300">
                                Place Bid
                            </Button>
                        </CardFooter>
                    </Card>
                ))
            }

        </>
    )
}
