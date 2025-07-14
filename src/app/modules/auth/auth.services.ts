import  httpStatus  from 'http-status-codes';
import AppError from "../../errorHandlers/AppError";
import { User } from '../user/user.model';
import bcryptjs from 'bcryptjs';
import { IUser } from '../user/user.interface';
import { createNewAccessTokenWithRefreshToken, createUserToken } from '../../utils/user.token';




const credentialsLogin = async(payload: Partial<IUser>)=>{

    const { email, password} = payload;

    const isUserExist = await User.findOne({email})

    if(!isUserExist){
        throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist")
    }

    const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

    if(!isPasswordMatched){
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
    }

    const userTokens = createUserToken(isUserExist)
 
    // delete isUserExist.password;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password: pass, ...rest} = isUserExist.toObject()

    return{
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    }
};

const getNewAccessToken = async(refreshToken: string)=>{

    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)   
    
    return{
       accessToken: newAccessToken
    }
};

export const AuthServices ={
    credentialsLogin,
    getNewAccessToken
    
}