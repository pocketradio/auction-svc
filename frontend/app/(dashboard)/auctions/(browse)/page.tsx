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

export default function Page() {
    const router = useRouter()
    const [auctions, setAuctions] = useState<Auction[]>([])
    const [userId, setuserId] = useState<number>(-1);

    useEffect(() => {
        fetch("http://localhost:5000/auctions")
            .then((response) => {
                if (response.status >= 400) {
                    throw new Error("Server error :( ")
                }
                return response.json()
            })
            .then((response) => setAuctions(response.auctions))

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
    }, [])

    useEffect(() => {
        if (userId === -1) { return; }
        const sse: EventSource = new EventSource("http://localhost:5000/streams")

        sse.addEventListener("message", (e) => {
            try {
                const parsedData = JSON.parse(e.data)

                if (parsedData.type === "auction_created") {
                    setAuctions(previousAuction => [
                        ...previousAuction,
                        ...parsedData.auctions,
                    ])
                } else if (parsedData.type === "created_bid") {
                    //only bidder sees toast
                    if (parsedData.userId === userId) {
                        toast.success("Successfully placed bid", {
                            richColors: true,
                        })
                    }

                    setAuctions(prev =>
                        prev.map(x =>
                            x.id === parsedData.auctionId
                                ? { ...x, currentBid: parsedData.currentBid }
                                : x
                        )
                    )
                } else if (parsedData.type === "auction_closed") {
                    setAuctions(prev =>
                        prev.filter(x => x.id !== parsedData.auctionId)
                    )
                }
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