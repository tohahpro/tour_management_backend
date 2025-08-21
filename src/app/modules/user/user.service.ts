import httpStatus  from 'http-status-codes';
import AppError from "../../errorHandlers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from 'bcryptjs'
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import { userSearchableFields } from './user.constant';
import { QueryBuilder } from '../../utils/QueryBuilder';

const createUser = async(payload: Partial<IUser>) =>{
    
    const { email,password, ...rest} = payload;

    const isUserExist = await User.findOne({email})

    if(isUserExist){
        throw new AppError(httpStatus.BAD_REQUEST, "User already exist")
    }

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))

    const authProvider: IAuthProvider={ provider: "credentials", providerId: email as string}

    const user = await User.create({
        email,
        password:hashedPassword,
        auths: [authProvider],
        ...rest
    })
    
    return user
}

const getAllUsers = async(query: Record<string,string>)=>{
    // const users = await User.find({});
    // const totalUsers = await User.countDocuments()

    // return{
    //     data: users,
    //     meta: {
    //         total: totalUsers
    //     }
    // }

    const queryBuilder = new QueryBuilder(User.find(), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .pagination()

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const getSingleUser = async (id: string) => {
    const user = await User.findById(id).select("-password");
    return {
        data: user
    }
};

const updateUser = async(userId: string, payload: Partial<IUser>, decodedToken: JwtPayload)=>{

    if(decodedToken.role === Role.USER && decodedToken.sub !== userId){
        if(userId !== decodedToken.userId){
            throw new AppError(401, "You are not authorized")
        }
    }    


    const ifUserExist = await User.findById(userId)

    if(!ifUserExist){
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    if(decodedToken.role == Role.ADMIN && ifUserExist.role === Role.SUPER_ADMIN){
        throw new AppError(401, "You are not authorized")
    }

    if(payload.role){
        if(decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE){
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized")
        }

        // if(payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN){
        //     throw new AppError(httpStatus.FORBIDDEN, "You are not authorized")
        // }   
    }

    if(payload.isActive || payload.isDeleted || payload.isVerified){
        if(decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE){
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized")
        }
    }

    if(payload.password){
        payload.password = await bcryptjs.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND))
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {new: true, runValidators: true})

    return newUpdatedUser
}

const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    return {
        data: user
    }
};

export const UserServices ={
    createUser,
    getAllUsers,
    getMe,
    updateUser,
    getSingleUser
}