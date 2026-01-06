import passport, { type DoneCallback } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { validateUserLogin, type AuthUser } from "../middleware/validateLogin.js";
import type { Request } from "express";

passport.use(
    new LocalStrategy({ usernameField: 'email', passwordField: "password" }, async (email, password, done) => {
        try {
            const user = await validateUserLogin(email, password);
            return done(null, user); // this goes into req.user

        } catch (err) {
            return done(err);
        }
    })
);

if (!process.env.JWT_SECRET) { // for typescript complaints
    throw new Error("JWT Secret not set");
}


const cookieExtractor = (req : Request | undefined ) => {
    return req?.cookies?.token || null;
    // looks for token in cookies. if found it returns. else null returned
}


passport.use(new JwtStrategy(

    {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET
    },

    async (payload: AuthUser, done: DoneCallback) => { // called only if passport verifies the token
        return done(null, payload);
    }
))

