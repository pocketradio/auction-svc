import { Router } from "express";
import type { Request,Response, NextFunction } from "express";
import passport from "passport";

const userRouter = Router();


userRouter.get("/",
    passport.authenticate("jwt", { session: false }), // calls next implicitly within
    (req : Request, res : Response, next : NextFunction) => {
        res.status(200).json(req.user); // passport sets the req.user if exists
})

export { userRouter };