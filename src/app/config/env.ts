import dotenv from "dotenv"


dotenv.config()

interface EnvConfig{
    PORT: string
    DB_URL: string
    NODE_ENV: string
    JWT_ACCESS_SECRET: string
    JWT_ACCESS_EXPIRES: string
    BCRYPT_SALT_ROUND: string
    SUPER_ADMIN_EMAIL: string
    SUPPER_ADMIN_PASSWORD: string
}

const loadEnvVariables = (): EnvConfig =>{

    const requiredEnvVariables: string[] = ["PORT", "DB_URL", "NODE_ENV", "BCRYPT_SALT_ROUND", "JWT_ACCESS_SECRET", "JWT_ACCESS_EXPIRES", "SUPPER_ADMIN_PASSWORD", "SUPER_ADMIN_EMAIL"];

    requiredEnvVariables.forEach(key=>{
        if(!process.env[key]){
            throw new Error(`Missing require environment variable ${key}`)
        }
    })

    return {
        PORT: process.env.PORT as string,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        DB_URL: process.env.DB_URL!,
        NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
        SUPPER_ADMIN_PASSWORD: process.env.SUPPER_ADMIN_PASSWORD as string
    }
}

export const envVars = loadEnvVariables()