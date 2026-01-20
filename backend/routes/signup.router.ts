import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import validateUserSignup from "../middleware/validateSignup.js";
import * as jwt from "jsonwebtoken";

const signupRouter = Router();

signupRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        const user = await validateUserSignup(name, email, password);
        const jwt_payload = { id: user.id, email: user.email };
        console.log("JWT import:", jwt)

        const token = jwt.sign(jwt_payload, process.env.JWT_SECRET!, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        })

        res.sendStatus(201);
    }
    catch (err) {
        next(err);
    }
})

export { signupRouter };