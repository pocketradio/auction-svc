import { Router } from "express";
import type { Request, Response } from "express";
import { createAuction, createBid, getAllAuctions, getAuction } from "../services/auction.service.js";
import passport from "passport";
import type { AuthUser } from "../middleware/validateLogin.js";
import { pub } from "../queue/client.js";
const auctionRouter = Router();

auctionRouter.get("/", async (req, res) => { // list of auctions
    const auctions = await getAllAuctions();
    if (auctions.length == 0) {
        return res.status(200).json({
            status: 'No available auctions currently :('
        })
    }
    res.json({
        auctions: auctions
    })
});


auctionRouter.get("/:id", async (req, res) => { // details of one auction
    const auctionId = parseInt(req.params.id);
    const auction = await getAuction(auctionId);
    if (!auction) {
        return res.status(404).json({
            error: 'Auction not found'
        })
    }

    res.json({
        auctionId: auctionId,
        auction: auction
    })
});

auctionRouter.post("/create", async (req: Request, res: Response) => {

    try {
        await createAuction(req);
        console.log('added auction to db');
        res.sendStatus(200);
    }
    catch (e) {
        res.status(400).send("Invalid auction data.");
    }
})

auctionRouter.post("/:id/bid", passport.authenticate("jwt", { session: false }) // if invalid, passport auto sends 401 to client
    , async (req: Request, res: Response) => {
        const { id, email } = req.user as AuthUser;
        const auctionId = Number(req.params.id);
        const { amount } = req.body as { amount: number };

        await pub.send(
            { exchange: 'bid', routingKey: 'bid.created', },
            {
                auctionId,
                id,
                email,
                amount,
                timestamp: Date.now()
            }
        );

        res.sendStatus(202);
    })

export { auctionRouter };
