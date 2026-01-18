"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch, type SubmitHandler } from "react-hook-form"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

type Auction = {
    id: number
    title: string
    description: string | null
    startingBid: string
    currentBid: string
    isActive: boolean
    ownerId: number
    createdAt: string
    endsAt: string
    winner: string
    winnerId: number
}

export default function AuctionPage() {
    const [open, setOpen] = useState(false);
    const { id } = useParams() as { id: string }
    const auctionId = Number(id)
    const router = useRouter();
    const [auction, setAuction] = useState<Auction | null>(null)
    const [userId, setUserId] = useState<number>(-1)

    useEffect(() => {
        fetch("http://localhost:5000/me", {
            credentials: "include"
        })
            .then((response) => {
                if (!response.ok) {
                    router.push('/login')
                    throw new Error("Not authenticated");
                }
                return response.json();
            })
            .then((user) => {
                const id = user.id;
                setUserId(id);
            })

        fetch(`http://localhost:5000/auctions/${auctionId}`)
            .then(r => r.json())
            .then(d => setAuction(d.auction))
    }, [auctionId, router])

    useEffect(() => {
        if (userId === -1) { return }
        const sse: EventSource = new EventSource(`http://localhost:5000/streams/${auctionId}`)

        sse.addEventListener("BID_CREATED", (e) => {
            const data = JSON.parse(e.data);

            if (data.userId === userId) {
                toast.success("Successfully placed a bid!", {
                    richColors: true
                })
            }
            else {
                toast.warning(`A bid of ${data.amount} was placed!`, {
                    richColors: true
                });
            }

            setAuction(prev => {
                if (prev === null) return null;
                return {
                    ...prev,
                    winner: data.winner,
                    winnerId: data.winnerId,
                    currentBid: data.amount
                }
            })
        })

        sse.addEventListener("AUCTION_CLOSED", (e) => {
            const data = JSON.parse(e.data);
            setOpen(false);
            setAuction(prev => {
                if (prev === null) return null;
                return {
                    ...prev,
                    isActive: false,
                    winner: data.winner,
                    winnerId: data.winnerId
                };
            });
        })


        sse.addEventListener("BID_REJECTED", (e) => {
            const data = JSON.parse(e.data);
            if (data.userId === userId) {
                toast.error("Bid too low! Someone placed a higher bid just before you.", {
                    richColors: true
                })
            }
        })


        return () => {
            sse.close();
        }
    }, [auctionId, userId])



    const bidSchema = z.object({
        bid: z.number().positive(),
    })

    const form = useForm<{ bid: number }>({
        resolver: zodResolver(bidSchema),
    })

    const bid = useWatch({ control: form.control, name: "bid" })
    const { isSubmitting } = form.formState

    const isValidBid =
        typeof bid === "number" &&
        !Number.isNaN(bid) &&
        auction !== null &&
        bid > Number(auction.currentBid)

    const submitBid: SubmitHandler<{ bid: number }> = async (values) => {
        if (userId === auction?.ownerId) {
            toast.error("You cannot bid in your own auction!", {
                richColors: true
            });
            return;
        }

        console.log("user id : ", userId);
        console.log("owner id : ", auction?.ownerId);
        if (values.bid <= Number(auction?.currentBid)) {
            toast.error("Bid too low")
            return
        }

        try {
            await fetch(`http://localhost:5000/auctions/${auctionId}/bid`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ amount: values.bid }),
            }).then((response) => {
                if (!response.ok) {
                    toast.error("Failed to reach server!", {
                        richColors: true
                    })
                }
                else {
                    toast.info("Attempting to place bid...", {
                        duration: 1000,
                        richColors: true
                    })
                }
            })

            setOpen(false);
        }
        catch {
            toast.warning("Network error! Please try again.", {
                richColors: true
            })
        }
    }

    if (!auction) return null

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-10 bg-linear-to-br from-zinc-950 to-zinc-900">

            <div className="text-center space-y-1 text-white">
                <div className="text-2xl font-semibold">
                    Auction {auction.id} : {auction.title}
                </div>
                <div className="text-sm text-zinc-400">
                    Owner #{auction.ownerId}
                </div>
            </div>

            <Card className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 shadow-xl backdrop-blur rounded-2xl">
                <CardHeader className="relative">
                    {auction.isActive && (
                        <Badge className="absolute top-4 right-4 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Live
                        </Badge>
                    )}

                    <CardTitle className="text-white">Auction Details</CardTitle>
                    <CardDescription className="pb-3 border-b border-zinc-700 text-zinc-400">
                        Ends {new Date(auction.endsAt).toLocaleString()}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-zinc-200">
                    <div>{auction.description}</div>

                    <div className="text-lg">
                        Current bid:{" "}
                        <span className="text-emerald-400 font-semibold">
                            ₹{auction.currentBid}
                        </span>
                    </div>

                    {auction.isActive ? (
                        <div className="pt-6 border-t border-zinc-800 space-y-3">
                            <div className="font-medium text-white">Place a Bid</div>
                            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder={`Min ₹${auction.currentBid}`}
                                    className="bg-zinc-800 border-zinc-700 focus:ring-2 focus:ring-emerald-500"
                                    {...form.register("bid", { valueAsNumber: true })}
                                />

                                {/* radix will call that internally . it's onOpenChange(boolean), since setOpen is passed, it is implicitly : setopen(that boolean) */}
                                <AlertDialog open={open} onOpenChange={setOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            disabled={!isValidBid || isSubmitting}
                                            className={`
                                                transition-all
                                                ${isValidBid
                                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-emerald-500/40"
                                                    : "bg-zinc-700 text-zinc-400 cursor-not-allowed"}
                                            `}
                                        >
                                            Bid
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-zinc-900 border border-zinc-800">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">
                                                Confirm Bid
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-zinc-400">
                                                Place bid of ₹{bid}?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={form.handleSubmit(submitBid)}
                                                className="bg-emerald-600 hover:bg-emerald-500"
                                            >
                                                Yes, place bid
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </form>
                        </div>
                    ) : (
                        <div className="pt-6 border-t border-zinc-800 space-y-3 text-center">
                            <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 mb-2">
                                Auction Closed
                            </Badge>
                            <div className="text-xl font-bold text-white">
                                {userId === auction.winnerId ? (
                                    <span className="text-emerald-400">🎉 You won the auction!</span>
                                ) : (
                                    <span>Winner: {auction.winner || "No winner"}</span>
                                )}
                            </div>
                            <div className="text-sm text-zinc-500">
                                Final Price: ₹{auction.currentBid}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}