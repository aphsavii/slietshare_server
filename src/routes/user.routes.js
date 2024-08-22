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
         editUserProfile,
         editBasicInfo,
         searchUsers,
         getNotifications,
         suggestedProfiles,
         userProfileView,
         getProfileViews
} from "../controllers/user.controller.js";
import { followUser, unfollowUser,getMyFollowers } from "../controllers/follow.controller.js";
import { validateProfile } from "../controllers/validate.controller.js";
const userRouter = Router();

userRouter.route('/register').post( 
    upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }
]),registerUser);


userRouter.get('/profile-views',verifyJwt,getProfileViews);
userRouter.post('/validate-profile',validateProfile);
userRouter.post('/generate-otp',generateOTP);
userRouter.post('/login',loginUser);
userRouter.get('/logout',logoutUser);
userRouter.get('/refresh-token',refreshTokenToAccessToken);
userRouter.post('/forgot-password',resetPassword);
userRouter.get('/followers',verifyJwt,getMyFollowers);
userRouter.get('/search',verifyJwt,searchUsers);
userRouter.post('/edit-profile',verifyJwt,editUserProfile);
userRouter.post('/edit-basic-profile',upload.fields([{name:'avatar',maxCount:1}]),verifyJwt,editBasicInfo);
userRouter.put('/follow/:regno',verifyJwt,followUser);
userRouter.delete('/unfollow/:regno',verifyJwt,unfollowUser);
userRouter.get('/notifications/unread',verifyJwt,getNotifications);
userRouter.get('/suggested-profiles',verifyJwt,suggestedProfiles);
userRouter.get('/:regno',verifyJwt,getUserDetails);
userRouter.post('/view-profile/:regno',verifyJwt,userProfileView);

export {userRouter}