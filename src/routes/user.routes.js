import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { registerUser,
         loginUser,
         generateOTP,
         logoutUser,
         refreshTokenToAccessToken
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route('/register').post( 
    upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }
]),registerUser);

userRouter.route('/generate-otp').post(generateOTP);
userRouter.route('/login').post(loginUser);
userRouter.route('/logout').get(logoutUser);
userRouter.route('/refresh-token').get(refreshTokenToAccessToken);

export {userRouter}