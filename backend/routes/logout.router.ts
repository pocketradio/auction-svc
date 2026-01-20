import { Router } from "express";
import type { Response, Request, NextFunction} from "express";

const logoutRouter = Router();

logoutRouter.get("/",(req : Request , res : Response , next : NextFunction) => {
    
    res.clearCookie('token', {
        httpOnly: true,
        sameSite:'lax',
        secure: process.env.NODE_ENV === "production"
    });
    
    console.log("Cookie cleared and logged out.");
    res.sendStatus(200);
})

export {logoutRouter};