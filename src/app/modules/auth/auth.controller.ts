/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus  from 'http-status-codes';
import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from '../../utils/sendResponse';
import { AuthServices } from './auth.services';
import AppError from '../../errorHandlers/AppError';

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    const loginInfo = await AuthServices.credentialsLogin(req.body)

    // set accessToken in cookies 
    res.cookie('accessToken', loginInfo.accessToken, {
        httpOnly: true,
        secure: false
    })

    // set refreshToken in cookies 
    res.cookie('refreshToken', loginInfo.refreshToken, {
        httpOnly: true,
        secure: false
    })
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
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken)

    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: 'User Logged In successfully',
        data : tokenInfo
    })
})

export const AuthControllers ={
    credentialsLogin,
    getNewAccessToken
}