/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus  from 'http-status-codes';
import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from '../../utils/sendResponse';
import { AuthServices } from './auth.services';
import AppError from '../../errorHandlers/AppError';
import { setAuthCookie } from '../../utils/setCookie';
import { createUserToken } from '../../utils/user.token';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import passport from 'passport';

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    // const loginInfo = await AuthServices.credentialsLogin(req.body)

    passport.authenticate("local",async(err: any, user: any, info: any)=>{
        
        if(err){
            // return new AppError(401, err)
            return next(new AppError(401, err))
        }

        if(!user){
            return next(new AppError(401, info.message))
        }

        const userTokens = await createUserToken(user)
        
        const {password: pass, ...rest} = user.toObject()

        setAuthCookie(res, userTokens)

        sendResponse(res,{
            success: true,
            statusCode: httpStatus.OK,
            message: 'User Logged In successfully',
            data : {
                accessToken : userTokens.accessToken,
                refreshToken : userTokens.refreshToken,
                user : rest
            }
        })
    })(req,res,next)

    // set accessToken and refresh in cookies 
    // setAuthCookie(res, loginInfo)

    // sendResponse(res,{
    //     success: true,
    //     statusCode: httpStatus.OK,
    //     message: 'User Logged In successfully',
    //     data : loginInfo
    // })
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken){
        throw new AppError(httpStatus.BAD_REQUEST, "Not refresh token received from cookies")
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string)
    setAuthCookie(res, tokenInfo)

    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: 'New access token retrived successfully',
        data : tokenInfo
    })
})


const logout = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    
    res.clearCookie("accessToken",{
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    res.clearCookie("refreshToken",{
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: 'User logged out successfully',
        data : null
    })
})

const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;

    await AuthServices.changePassword(oldPassword,newPassword, decodedToken as JwtPayload)

    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: 'Password changed successfully',
        data : null
    })
})

const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

    const {email} = req.body
    await AuthServices.forgotPassword(email);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Email send Successfully",
        data: null,
    })    
})

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

    const decodedToken = req.user;
    await AuthServices.resetPassword(req.body, decodedToken as JwtPayload)

    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: 'Password changed successfully',
        data : null
    })
})


const setPassword = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

    const decodedToken = req.user as JwtPayload
    const { password } = req.body;

    await AuthServices.setPassword(decodedToken.userId, password);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Changed Successfully",
        data: null,
    })    
})


const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

    let redirectTo = req.query.state ? req.query.state as string : '/' 
    if(redirectTo.startsWith('/')){
        redirectTo = redirectTo.slice(1)

    }
    const user = req.user;
    if(!user){
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    const tokenInfo = await createUserToken(user)
    setAuthCookie(res, tokenInfo)

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
})


export const AuthControllers ={
    credentialsLogin,
    getNewAccessToken,
    logout,
    changePassword,
    resetPassword,
    setPassword,
    forgotPassword,
    googleCallbackController
}