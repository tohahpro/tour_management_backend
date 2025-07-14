import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHandlers/AppError";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import { IsActive } from '../modules/user/user.interface';

export const checkAuth = (...athRoles: string[])=>async(req: Request, res: Response, next: NextFunction)=>{
    try {
        const accessToken = req.headers.authorization;

        if(!accessToken){
            throw new AppError(403, "No Token Received")
        }

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload

        const isUserExist = await User.findOne({email: verifiedToken.email})

        if(!isUserExist){
            throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist")
        }
        if(isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE){
            throw new AppError(httpStatus.BAD_REQUEST, `user is ${isUserExist.isActive}`)
        }
        if(isUserExist.isDeleted){
            throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
        }

        if(!athRoles.includes(verifiedToken.role)){
            throw new AppError(403, "You are not Permitted to view this route!!")
        }
        req.user = verifiedToken
        next()
    } catch (error) {
        next(error)
    }
}