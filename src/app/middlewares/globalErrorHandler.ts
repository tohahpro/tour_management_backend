/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response} from 'express';
import { envVars } from "../config/env"
import AppError from '../errorHandlers/AppError';
import { handleDuplicateError } from '../helpers/handleDuplicateError';
import { handleCastError } from '../helpers/handleCastError';
import { handleZodError } from '../helpers/handleZodError';
import { handleValidationError } from '../helpers/validationError';
import { TErrorSources } from '../interfaces/error.types';

export const globalErrorHandler = (err:any, req: Request, res:Response, next: NextFunction)=>{
    
    let statusCode = 500
    let message= `something went wrong!!`

    let errorSources : TErrorSources[]= []

    // Duplicate 
    if(err.code === 11000){
        // const duplicate = err.message.match(/"([^"]*)"/)
        const simplifiedError = handleDuplicateError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message
    }
    // ObjectId / CastError 
    else if(err.name === 'CastError'){
        const simplifiedError = handleCastError(err)
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message
    }
    // Zod Error
    else if(err.name === "ZodError"){
        const simplifiedError = handleZodError(err)
        statusCode = simplifiedError.statusCode
        message = simplifiedError.message
        errorSources = simplifiedError.errorSources as TErrorSources[]
    }
    else if (err.name === "ValidationError") {
        const simplifiedError = handleValidationError(err)
        statusCode = simplifiedError.statusCode;
        errorSources = simplifiedError.errorSources as TErrorSources[]
        message = simplifiedError.message
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
        err: envVars.NODE_ENV === "development" ? err : null,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}
