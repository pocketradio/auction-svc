import type { Auction } from "@prisma/client";
import { prisma } from "./prisma.js"
import * as z from "zod";

export async function getUsers() {

		const users = await prisma.user.findMany()
    console.log("PRISMA_OK:", users)
    return users;
}

export async function getAllAuctions(){
  const auctions = await prisma.auction.findMany();
  return auctions;
}

export async function getAuction(auctionId:number){
  
  const auction = await prisma.auction.findUnique({
    where:{
      id : auctionId
    }
  })

  return auction;

}


const zodAuctionSchema = z.object({
  title : z.string().min(1),
  description : z.string().nullable(), // description type is now string or null ( matches prisma )
  startingBid : z.coerce.number().int().positive(),
  endsAt : z.coerce.date().refine(d => d > new Date(),{
    message : "endsAt must be in the future",
  })
});


export async function createAuction(req : Request ){
  console.log("auction hi");

  const parsed = zodAuctionSchema.safeParse(req.body);
  
  if (!parsed.success) {
    throw parsed.error;
  }

  return await prisma.auction.create({
    data:{
      ...parsed.data,
      // ownerId : req.user.id,
      ownerId : 1, // placeholder until JWT impl above
      currentBid : parsed.data.startingBid
    }
  })
}

export async function createBid(){
  
}

