import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import  jwt  from 'jsonwebtoken';
import { User } from "../models/user.model.js";

const verifyJwt = asyncHandler(
    async (req,_,next)=>{
        const accessToken = req?.cookies?.accessToken || req    .header("Authorization")?.replace("Bearer ","");
        if(!accessToken) throw new ApiError("Unauthorized request",401);

        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken?._id).select('-password -refreshToken');
        // console.log(user)
        if(!user) throw new ApiError("Invalid access token",401);

        req.user=user;
        next();
    }
)

export { verifyJwt };