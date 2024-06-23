import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import {verifyJwt} from "../middlewares/auth.middleware.js";
import { registerUser,
         loginUser,
         generateOTP,
         logoutUser,
         refreshTokenToAccessToken,
         getUserDetails,
         resetPassword,
         editUserProfile
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route('/register').post( 
    upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }
]),registerUser);


userRouter.post('/generate-otp',generateOTP);
userRouter.post('/login',loginUser);
userRouter.get('/logout',logoutUser);
userRouter.get('/refresh-token',refreshTokenToAccessToken);
userRouter.post('/forgot-password',resetPassword);
userRouter.get('/:regno',verifyJwt,getUserDetails);
userRouter.post('/edit-profile',verifyJwt,editUserProfile);

export {userRouter}