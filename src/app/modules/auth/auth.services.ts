/* eslint-disable @typescript-eslint/no-explicit-any */
import  jwt  from 'jsonwebtoken';
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import  httpStatus  from 'http-status-codes';
import AppError from "../../errorHandlers/AppError";
import { User } from '../user/user.model';
import bcryptjs from 'bcryptjs';
import { IAuthProvider, IsActive, IUser } from '../user/user.interface';
import { createNewAccessTokenWithRefreshToken, createUserToken } from '../../utils/user.token';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';
import { sendEmail } from '../../utils/sendEmail';


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


const forgotPassword = async(email: string)=>{

    const isUserExist = await User.findOne({email})

    if(!isUserExist){
            throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist")
        }
        if(isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE){
            throw new AppError(httpStatus.BAD_REQUEST, `user is ${isUserExist.isActive}`)
        }
        if(isUserExist.isDeleted){
            throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
        }
        if(!isUserExist.isVerified){
            throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
        }

    // step-2 
    const jwtPayload={
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    // step-3
    const resetToken= jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
        expiresIn: '10m'
    })

    // step-4 reset ui link
    const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`

    sendEmail({
        to: isUserExist.email,
        subject: "Reset Password",
        templateName: "forgetPassword",
        templateData:{
            name: isUserExist.name,
            resetUILink
        }
    })   

};

const resetPassword = async(payload: Record<string, any>, decodedToken: JwtPayload)=>{

    if(payload.id != decodedToken.userId){
        throw new AppError(401,"Can not reset your password")
    }

    const isUserExist = await User.findById(decodedToken.userId)
    if(!isUserExist){
        throw new AppError(404, "User Not Found");
    }

    const hashedPassword = await bcryptjs.hash(
        payload.newPassword,
        Number(envVars.BCRYPT_SALT_ROUND)
    )
    isUserExist.password = hashedPassword;

    await isUserExist.save();
};

export const AuthServices ={
    credentialsLogin,
    getNewAccessToken,
    resetPassword,
    changePassword,
    setPassword,
    forgotPassword
    
}