import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import {verifyJwt} from "../middlewares/auth.middleware.js";
import { registerUser,
         loginUser,
         generateOTP,
         logoutUser,
         refreshTokenToAccessToken,
         getUserDetails
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route('/register').post( 
    upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }
]),registerUser);

// userRouter.route('/generate-otp').post(generateOTP);
// userRouter.route('/login').post(loginUser);
// userRouter.route('/logout').get(logoutUser);
// userRouter.route('/refresh-token').get(refreshTokenToAccessToken);
// userRouter.route('/:regno').get(verifyJwt,getUserDetails,);

userRouter.post('/generate-otp',generateOTP);
userRouter.post('/login',loginUser);
userRouter.get('/logout',logoutUser);
userRouter.get('/refresh-token',refreshTokenToAccessToken);
userRouter.get('/:regno',verifyJwt,getUserDetails);

export {userRouter}