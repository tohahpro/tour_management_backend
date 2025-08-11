/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction,Request , Response} from 'express';
import httpStatus from "http-status-codes"
import { UserServices } from "./user.service";
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { verifyToken } from '../../utils/jwt';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';


const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    const user = await UserServices.createUser(req.body)

    sendResponse(res,{
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'User created successfully',
        data : user
    })
})


const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    
    const userId = req.params.id;
    // const token = req.headers.authorization
    // const verifiedToken = verifyToken(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload
    const verifiedToken = req.user
    const payload = req.body

    const user = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload)

    sendResponse(res,{
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'User Updated successfully',
        data : user
    })
})


const getAllUsers = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const query = req.query
    const result = await UserServices.getAllUsers(query as Record<string,string>)
    
    sendResponse(res,{
        success: true,
        statusCode: httpStatus.CREATED,
        message: 'All users Retrieve successfully',
        data : result.data,
        meta : result.meta
    })
})

const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload
    const result = await UserServices.getMe(decodedToken.userId);

    // res.status(httpStatus.OK).json({
    //     success: true,
    //     message: "All Users Retrieved Successfully",
    //     data: users
    // })
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Your profile Retrieved Successfully",
        data: result.data
    })
})

export const UserControllers = {
    createUser,
    getAllUsers,
    updateUser,
    getMe
}