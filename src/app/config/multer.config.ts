import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";


const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params:{
        public_id : (req, file)=>{
            const fileName = file.originalname
                .toLowerCase()
                .replace(/\s+/g,"-") // empty space remove replace with dash
                .replace(/\./g,"-") // dot remove replace with dash
                .replace(/[^a-zA-Z0-9]/g, "")  // non alpha numeric - !@#

            const extension = file.originalname.split(".").pop()

            const uniqueFileName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileName+ "." + extension
            
            return uniqueFileName
        }
    }
})

export const multerUpload = multer({ storage: storage })