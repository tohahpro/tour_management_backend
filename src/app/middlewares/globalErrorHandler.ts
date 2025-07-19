/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response} from 'express';
import { envVars } from "../config/env"
import AppError from '../errorHandlers/AppError';

export const globalErrorHandler = (err:any, req: Request, res:Response, next: NextFunction)=>{
    
    let statusCode = 500
    let message= `something went wrong!!`

        const errorSources= [
            // {
            //     path: "isDeleted",
            //     message: "Cast Failed"
            // }
        ]

    // Duplicate 
    if(err.code === 11000){
        const duplicate = err.message.match(/"([^"]*)"/)
        statusCode = 400;
        message = `${duplicate[1]} already exists!!`
    }
    // ObjectId / CastError 
    else if(err.name === 'CastError'){
        statusCode = 500;
        message = "Invalid mongoDB ObjectId. Please provide a valid id"
    }
    else if (err.name === "ValidationError") {
        statusCode = 400;
        const errors = Object.values(err.errors);

        errors.forEach((errorObject: any) => errorSources.push({
            path: errorObject.path,
            message: errorObject.message
        }));
        message = "Validation error occurred";
    }
    else if(err instanceof AppError){
        statusCode = err.statusCode
        message = err.message
    }else if(err instanceof Error){
        statusCode = 500;
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message : `${err.message}`,
        err,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}
