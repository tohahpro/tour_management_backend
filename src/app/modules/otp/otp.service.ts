import crypto from 'crypto'
import { redisClient } from '../../config/redis.config';
import { sendEmail } from '../../utils/sendEmail';
import AppError from '../../errorHandlers/AppError';
import { User } from '../user/user.model';


const OTP_EXPIRATION = 3 * 60; // 3 Minutes

const generateOtp = (length = 4) => {
    const otp = crypto.randomInt(2 ** (length - 1), 10 ** length).toString()
    // 10 ** 4 => 10 * 10 * 10 * 10 => 10000

    return otp
}

const sendOTP = async (email: string, name: string) => {
    
    const user = await User.findOne({email})
    if(!user){
        throw new AppError(404, "User not found")
    }

    if(user.isVerified){
        throw new AppError(401, "Your are already verified")
    }

    const otp = generateOtp();
    const redisKey = `otp:${email}`

    await redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION
        }
    })

    await sendEmail({
        to: email,
        subject: "Your OTP Code",
        templateName: "otp",
        templateData: {
            name: name,
            otp: otp
        }
    })

};

const verifyOTP = async (email: string, otp: string) => {
    
    const user = await User.findOne({email})
    if(!user){
        throw new AppError(404, "User not found")
    }
    if(user.isVerified){
        throw new AppError(401, "Your are already verified")
    }

    const redisKey = `otp:${email}`
    const savedOtp = await redisClient.get(redisKey)

    if (!savedOtp) {
        throw new AppError(401, "Invalid OTP")
    }

    if (savedOtp !== otp) {
        throw new AppError(401, "Invalid OTP")
    }

    await Promise.all([
        User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
        redisClient.del([redisKey])
    ])
};

export const OTPService = {
    sendOTP,
    verifyOTP
}