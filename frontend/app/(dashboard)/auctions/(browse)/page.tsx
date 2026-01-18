"use client"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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

export default function Lobby() {
    const router = useRouter()
    const [auctions, setAuctions] = useState<Auction[]>([])
    const [userId, setuserId] = useState<number>(-1);

    useEffect(() => {
        fetch("http://localhost:5000/me", {
            credentials: "include"
        })
            .then((response) => {
                if (!response.ok) {
                    router.push("/login");
                    throw new Error("Not Authenticated");
                }

                return response.json();
            })
            .then((user) => {
                const id = user.id;
                setuserId(id);

            })

        fetch("http://localhost:5000/auctions")
            .then((response) => {
                if (response.status >= 400) {
                    throw new Error("Server error :( ")
                }
                return response.json()
            })
            .then((response) => setAuctions(response.auctions))


    }, [router])


    useEffect(() => {
        if (userId === -1) { return; }
        const sse: EventSource = new EventSource("http://localhost:5000/streams/lobby")

        sse.addEventListener("AUCTION_CREATED", (e) => {
            try {
                const parsedData = JSON.parse(e.data)
                console.log("THE AUCTION CREATE DATA : ", parsedData, "\n\n");
                setAuctions(previousAuction => {
                    const isDup = previousAuction.some(auction => auction.id === parsedData.id)

                    if (isDup) { return previousAuction }
                    return [parsedData, ...previousAuction];
                })
            }

            catch (e) {
                console.error(e)
            }
        })


        sse.addEventListener("BID_CREATED", (e) => {
            try {
                const parsedData = JSON.parse(e.data);
                console.log("\n\nHIII, ", parsedData);
                setAuctions(prev =>
                    prev.map(x =>
                        x.id === parsedData.auctionId
                            ? { ...x, currentBid: parsedData.amount }
                            : x
                    )
                )
            } catch (e) {
                console.error(e)
            }
        })

        sse.addEventListener("AUCTION_CLOSED", (e) => {
            try {
                const parsedData = JSON.parse(e.data)
                setAuctions(prev =>
                    prev.filter(x => x.id !== parsedData.auctionId)
                )
            } catch (e) {
                console.error(e)
            }
        })

        return () => {
            sse.close()
        }
    }, [userId])

    return (
        <>
            {auctions.map((e) => (
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
                        <Button
                            onClick={() => {
                                router.push(`/auctions/${e.id}`)
                            }}
                            type="button"
                            className="w-full hover:bg-green-300"
                        >
                            Place Bid
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </>
    )
}