/* eslint-disable @typescript-eslint/no-non-null-assertion */
import  httpStatus  from 'http-status-codes';
import AppError from "../../errorHandlers/AppError";
import { User } from '../user/user.model';
import bcryptjs from 'bcryptjs';
import { IAuthProvider, IUser } from '../user/user.interface';
import { createNewAccessTokenWithRefreshToken, createUserToken } from '../../utils/user.token';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';


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

const resetPassword = async(oldPassword: string, newPassword: string, decodedToken: JwtPayload)=>{

    const user = await User.findById(decodedToken.userId)

    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user?.password as string)
    if(!isOldPasswordMatch){
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password dose not matched")
    }

    user!.password=await bcryptjs.hash(newPassword as string, Number(envVars.BCRYPT_SALT_ROUND));
    user!.save();

};

const changePassword = async(oldPassword: string, newPassword: string, decodedToken: JwtPayload)=>{

    const user = await User.findById(decodedToken.userId)

    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user?.password as string)
    if(!isOldPasswordMatch){
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password dose not matched")
    }

    user!.password=await bcryptjs.hash(newPassword as string, Number(envVars.BCRYPT_SALT_ROUND));
    user!.save();

};

const setPassword = async(userId: string, planePassword: string)=>{

    const user = await User.findById(userId)

    if(!user){
        throw new AppError(404, "User Not Found");

    }

    if(user.password && user.auths.some(providerObject => providerObject.provider === "google")){
        throw new AppError(httpStatus.BAD_REQUEST, "You have already set your password. Now you can change the password from your profile password update.")
    }

    const hashedPassword = await bcryptjs.hash(
        planePassword,
        Number(envVars.BCRYPT_SALT_ROUND)
    )

    const credentialProvider : IAuthProvider = {
        provider: "credentials",
        providerId: user.email
    }

    const auths : IAuthProvider[] = [...user.auths, credentialProvider]

    user.password = hashedPassword

    user.auths = auths

    await user.save()

};

export const AuthServices ={
    credentialsLogin,
    getNewAccessToken,
    resetPassword,
    changePassword,
    setPassword
    
}