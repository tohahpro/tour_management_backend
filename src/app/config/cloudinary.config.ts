/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { envVars } from './env';
import AppError from '../errorHandlers/AppError';
import stream from 'stream';


cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
})


export const uploadBufferCloudinary = async (buffer: Buffer, fileName: string) : Promise<UploadApiResponse | undefined> => {
    try {
        // step-1 
        return new Promise((resolve, reject) => {
            const public_id = `pdf/${fileName}-${Date.now()}`

            // step-2
            // for buffer steam ready stream er maddhome chank e chank e amra pathabo cloudinary te
            const bufferStream = new stream.PassThrough()
            bufferStream.end(buffer)

            // step-3
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    public_id: public_id,
                    folder: 'pdf',
                }, (error, result) => {
                    if (error) {
                        return reject(error)
                    }
                    resolve(result)
                }
            ).end(buffer)
        })

    } catch (error: any) {
        console.log(error);
        throw new AppError(401, `Cloudinary upload failed ${error.message}`)

    }
}



export const deleteImageFromCloudinary = async (url: string) => {
    try {
        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;

        const match = url.match(regex)
        // console.log(match);


        if (match && match[1]) {
            const public_id = match[1];
            await cloudinary.uploader.destroy(public_id)
            // console.log(`File ${public_id} is deleted from cloudinary.`);

        }
    } catch (error: any) {
        throw new AppError(401, "Cloudinary image deletion failed", error.message)
    }
}

export const cloudinaryUpload = cloudinary