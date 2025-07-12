import { NextFunction, Request, Response } from "express";
import AppError from "../errorHandlers/AppError";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";

export const checkAuth =(...athRoles: string[])=>(req: Request, res: Response, next: NextFunction)=>{
    try {
        const accessToken = req.headers.authorization;

        if(!accessToken){
            throw new AppError(403, "No Token Received")
        }

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload

        if(!athRoles.includes(verifiedToken.role)){
            throw new AppError(403, "You are not Permitted to view this route!!")
        }
        req.user = verifiedToken
        next()
    } catch (error) {
        next(error)
    }
}