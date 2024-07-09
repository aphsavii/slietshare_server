import Follow from "../models/follow.modal.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {User} from "../models/user.model.js";

const followUser = asyncHandler(async (req,res)=>{
    const userRegno = req.user.regno;
    const followedRegno = req?.params?.regno;
    if(!userRegno) return new ApiError("Unauthorized request",401);
    if(!followedRegno) return new ApiError("Please provide the regno of the user you want to follow",400);
    
    const user= await User.findOne({regno: userRegno});
    if(!user) return res.status(404).json(new ApiError("User not found",404));
    
    const followedUser = await User.findOne({regno: followedRegno});
    if(!followedUser) return res.status(404).json(new ApiError("User not found",404));
    
    const follow = await Follow.findOne({follower: user._id, following: followedUser._id});
    if(follow) return res.status(400).json(new ApiError("You are already following this user",400));

    const newFollow = await Follow.create({follower: user._id, following: followedUser._id});
    if(!newFollow) return res.status(500).json(new ApiError("Could not follow user",500));

    return res.status(200).json(new ApiResponse(201, "User followed successfully",newFollow));

});

const unfollowUser = asyncHandler(async (req,res)=>{
    const userRegno = req.user.regno;
    const followedRegno = req?.params?.regno;
    if(!userRegno) return res.status(401).json(new ApiError("Unauthorized request",401));
    if(!followedRegno) return res.status(400).json(new ApiError("Please provide the regno of the user you want to unfollow",400));

    const user= await User.findOne({regno: userRegno});
    if(!user) return res.status(404).json(new ApiError("User not found",404));

    const followedUser = await User.findOne({regno: followedRegno});
    if(!followedUser) return res.status(404).json(new ApiError("User not found",404));

    const follow = await Follow.findOne({follower: user._id, following: followedUser._id});
    if(!follow) return  res.status(400).json(new ApiError("You are not following this user",400));

    const deletedFollow = await Follow.findByIdAndDelete(follow._id);
    if(!deletedFollow) return res.status(500).json(new ApiError("Could not unfollow user",500));

    return res.status(200).json(new ApiResponse(200, "User unfollowed successfully",deletedFollow));

});

const getMyFollowers = asyncHandler(async (req,res)=>{
    const userRegno = req.user.regno;
    if(!userRegno) return res.status(401).json(new ApiError("Unauthorized request",401));

    const user= await User.findOne({regno: userRegno});
    if(!user) return res.status(404).json(new ApiError("User not found",404));

    const followers = await Follow.find({following: user._id}).populate({
        path: "follower",
        select: "fullName regno avatarUrl trade",
    });
    if(!followers) return res.status(404).json(new ApiError("No followers found",404));

    const followerDetails = followers.map(follow => follow.follower);
    return res.status(200).json(new ApiResponse(200, "Followers found successfully", followerDetails));

});

export {followUser,unfollowUser,getMyFollowers};