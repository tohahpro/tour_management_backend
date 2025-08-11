import { UserControllers } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { Router } from "express";



const router = Router()



router.post('/register',validateRequest(createUserZodSchema),UserControllers.createUser)
    
router.get('/all-users',checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers)
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe)
router.patch('/:id',checkAuth(...Object.values(Role)),validateRequest(updateUserZodSchema), UserControllers.updateUser)

export const UserRoutes = router

 