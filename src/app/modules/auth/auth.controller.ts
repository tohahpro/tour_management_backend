/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus  from 'http-status-codes';
import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from '../../utils/sendResponse';
import { AuthServices } from './auth.services';
import AppError from '../../errorHandlers/AppError';
import { setAuthCookie } from '../../utils/setCookie';

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    const loginInfo = await AuthServices.credentialsLogin(req.body)

    // set accessToken and refresh in cookies 
    setAuthCookie(res, loginInfo)

    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: 'User Logged In successfully',
        data : loginInfo
    })
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

export const AuthControllers ={
    credentialsLogin,
    getNewAccessToken,
    logout
}