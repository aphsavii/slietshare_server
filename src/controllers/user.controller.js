import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { DEFAULT_AVATAR } from "../constants.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/uploadOnCloudinary.js";
import { redisClient, verifyOTP } from "../connections/redisConnect.js";
import { sendMail } from "../utils/email/sendMail.js";
import jwt from "jsonwebtoken";
import { otpFormat } from "../utils/email/otpFormat.js";
import Follow from "../models/follow.modal.js";
import { getUnreadNotifications } from "../webSockets/utils/index.js";
import { convertToWebp } from "../utils/convertToWebp.js";

// REGISTER USER CONTROLLER
const registerUser = asyncHandler(async (req, res, next) => {
  const { regno, email, fullName, programme, batch, trade, password, otp } =
    req.body;

  if (
    [regno, email, fullName, programme, batch, trade, password, otp].some(
      (field) => {
        let temp = field ?? "";
        return temp === "";
      }
    )
  ) {
    return res
      .status(400)
      .json(
        new ApiError(
          "regno, email, fullName, programme, batch, trade,password, otp are mandatory",
          400
        )
      );
  }

  // veryfying otp
  if (!otp)
    return res
      .status(401)
      .json(newApiError("OTP is mandoatory", 400, ["Invalid OTP"]));
  else {
    const verified = await verifyOTP(otp, email);
    if (!verified)
      return res
        .status(401)
        .json(new ApiError("Invalid OTP", 401, ["Invalid OTP"]));
  }

  const registeredUser = await User.findOne({
    $or: [{ regno }, { email }],
  });

  if (registeredUser)
    return res.status(401).json(new ApiError("user already registered", 400));

  let localAvatarUrl;
  let avatarUrl = DEFAULT_AVATAR;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    localAvatarUrl = req.files.avatar[0]?.path;
    const upload = await uploadOnCloudinary(localAvatarUrl, "/avatar");
    if (!upload)
      return res
        .status(500)
        .json(
          new ApiError("Internal Server Error", 500, ["ERROR UPLOADING AVATAR"])
        );
    else avatarUrl = upload;
  }

  const user = await User.create({
    regno,
    fullName,
    email,
    programme,
    batch,
    trade,
    avatarUrl,
    password,
  });

  if (!user)
    return res
      .status(500)
      .json(
        new ApiError("Internal Server Error", 500, [
          "Somethig went wrong while registering user",
        ])
      );
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(201)
    .json(new ApiResponse(200, "User Registered successfully", createdUser));
});

// GENERATE OTP CONTROLLER
const generateOTP = asyncHandler(async (req, res) => {
  let { name, email } = req.body;
  if (!email)
    return res
      .status(400)
      .json(new ApiResponse(400, "Email and Name is mandatory"));

  if (!name) {
    const user = await User.findOne({ email: email });
    if (!email)
      return res.status(404).json(new ApiResponse(404, "User not found"));
    name = user.fullName.split(" ")[0];
  }
  // OTP GENERATION
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  // SAVE OTP IN REDIS
  const setOTP = await redisClient.set(
    `otp:${email}`,
    otp,
    { EX: 300 },
    (err, reply) => {
      if (!reply)
        return res
          .status(500)
          .json(
            new ApiResponse(500, "Internal Server Error", [
              "Error saving OTP to redis",
            ])
          );
    }
  );

  // SEND OTP TO EMAIL
  const mail = await sendMail(
    email,
    "OTP from SLIETshare",
    otpFormat(otp, name.split(" ")[0])
  );
  if (!mail)
    return res
      .status(500)
      .json(
        new ApiResponse(500, "Internal Server Error", [
          "Error sending OTP to email",
        ])
      );

  res.status(200).json(new ApiResponse(200, "OTP generated successfully"));
});

// LOGIN USER CONTROLLER
const loginUser = asyncHandler(async (req, res) => {
  // await new Promise((resolve) => setTimeout(resolve, 100000));
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json(new ApiError("Email and password are mandatory", 400));

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json(new ApiError("User not found", 401));

  const match = await user.comparePassword(password);
  if (!match)
    return res.status(401).json(new ApiError("Invalid Password", 401));

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  const RefresTokenoptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
  };

  const AccessTokenoptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  };

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -mobile -coins -createdAt -updatedAt -__v  -education -workExperience -projects -achievements -skills -socialLinks -profileTags -location -about -resumeUrl"
  );
  loggedInUser.refreshToken = refreshToken;
  await loggedInUser.save({ validateBeforeSave: false });

  res
    .status(200)
    .cookie("accessToken", accessToken, AccessTokenoptions)
    .cookie("refreshToken", refreshToken, RefresTokenoptions)
    .json(
      new ApiResponse(200, "Login Successfull", {
        loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

//  LOGOUT USER

const logoutUser = asyncHandler(async (req, res) => {
  // take user from frontend
  // delete refresh token
  // remove cookies

  const user = await User.findOneAndUpdate(
    { email: req?.user?.email },
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged Out", []));
});

// REFRESH TOKEN
const refreshTokenToAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req?.cookies?.refreshToken ??
    req?.header("Authorization")?.replace("Bearer ", "");
  if (!incomingRefreshToken)
    return res
      .status(401)
      .json(new ApiError("Refresh Token is mandatory", 401));

  const userId = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET)._id;
  const user = await User.findById(userId).select("-password");

  if (!user) return res.status(401).json(new ApiError("User not found", 401));

  if (user.refreshToken !== incomingRefreshToken)
    return res.status(401).json(new ApiError("Invalid Refresh Token", 401));

  const { accessToken, refreshToken } =
    await user.generateAccessAndRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const AccessTokenoptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  };

  const RefresTokenoptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, AccessTokenoptions)
    .cookie("refreshToken", refreshToken, RefresTokenoptions)
    .json(
      new ApiResponse(200, "Token Refreshed successfully", {
        user,
        accessToken,
        refreshToken,
      })
    );
});

const getUserDetails = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json(new ApiError("Unauthorized Request", 401));
  }

  // Get user from frontend
  const regno = req?.params?.regno;
  if (!regno) {
    return res.status(400).json(new ApiError("Regno is mandatory", 400));
  }

  const user = await User.findOne({ regno }).select(
    "-password -refreshToken -mobile -coins"
  );
  if (!user) {
    return res.status(404).json(new ApiError("User not found", 404));
  }

  const followers = await Follow.find({ following: user._id }).countDocuments();
  const isFollowing = await Follow.findOne({
    follower: req.user._id,
    following: user._id,
  });

  // Convert Mongoose document to plain JavaScript object
  const userObject = user.toObject();
  userObject.followers = followers;
  userObject.isFollowing = isFollowing ? true : false;

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User details fetched successfully", userObject)
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, password, otp } = req.body;
  if (!email || !password || !otp)
    return res
      .status(400)
      .json(new ApiError("Email, Password and OTP are mandatory", 400));

  const user = await User.findOne({ email: email });
  if (!user) return res.status(404).json(new ApiError("User not found", 404));

  const verified = await verifyOTP(otp, email);
  if (!verified) return res.status(401).json(new ApiError("Invalid OTP", 401));

  user.password = password;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset successfully", []));
});

const getMyProfile = asyncHandler(async (req, res) => {
  const regno = req.user.regno;
  if (!regno)
    return res.status(400).json(new ApiError("Unauthorized Request", 401));

  const user = await User.findOne({ regno }).select("-password -refreshToken");
  if (!user) return res.status(404).json(new ApiError("User not found", 404));

  const followers = await Follow.find({ following: user._id }).countDocuments();
  const userObject = user.toObject();
  userObject.followers = followers;

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User details fetched successfully", userObject)
    );
});

// Edit profile controllers
const editBasicInfo = asyncHandler(async (req, res) => {
  const regno = req?.user?.regno;
  if (!regno)
    return res.status(401).json(new ApiError("Unauthorized reqeust!", 401));

  const { headLine, pronouns } = req.body;
  if (!headLine || !pronouns)
    return res
      .status(400)
      .json(new ApiError("Headline and pronouns are mandatory", 400));

  const user = await User.findOne({ regno }).select(
    "headLine pronouns avatarUrl"
  );
  if (!user) return res.status(404).json(new ApiError("User not found", 404));

  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    const localAvatarUrl = req.files.avatar[0]?.path;
    const webpUrl = await convertToWebp(localAvatarUrl, 80);
    if (!webpUrl)
      return res
        .status(500)
        .json(
          new ApiError("Internal Server Error", 500, [
            "Error compressing avatar",
          ])
        );

    const upload = await uploadOnCloudinary(webpUrl, "/avatar");
    if (!upload)
      return res
        .status(500)
        .json(
          new ApiError("Internal Server Error", 500, ["Error uploading avatar"])
        );
    if (user.avatarUrl !== DEFAULT_AVATAR) {
      const deleted = await deleteFromCloudinary(user.avatarUrl);
      if (!deleted) console.log("Error deleting old avatar");
    }
    user.avatarUrl = upload;
  }

  user.headLine = headLine;
  user.pronouns = pronouns;

  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "User details updated successfully", user));
});

const editUserProfile = asyncHandler(async (req, res) => {
  const regno = req?.user?.regno;

  if (
    req.body.email ||
    req.body.regno ||
    req.body.password ||
    req.body.refreshToken
  )
    return res.status(400).json(new ApiError("Unauthorized Request", 401));

  if (!regno)
    return res.status(400).json(new ApiError("Unauthorized Request", 401));

  const user = await User.findOne({ regno }).select(`-password -refreshToken`);
  if (!user) return res.status(404).json(new ApiError("User not found", 404));

  for (let field in req.body) {
    user[field] = req.body[field];
  }
  await user.save({ validateBeforeSave: false });

  let editedData = {};
  for (let field in req.body) {
    editedData[field] = user[field];
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User details updated successfully", editedData)
    );
});

const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q)
    return res.status(400).json(new ApiError("Search query is mandatory", 400));
  const users = await User.find({
    $and: [
      {
        $or: [
          { fullName: { $regex: q, $options: "i" } },
          { headLine: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { programme: { $regex: q, $options: "i" } },
          { trade: { $regex: q, $options: "i" } },
        ],
      },
      { regno: { $ne: +req.user.regno } }, // exclude users with the specified regno
    ],
  })
    .limit(5)
    .select("fullName regno headLine avatarUrl programme trade");

  return res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully", users));
});

const getNotifications = asyncHandler(async (req, res) => {
  const regno = req?.user?.regno;
  if (!regno)
    return res.status(401).json(new ApiError("Unauthorized Request", 401));
  const notifications = await getUnreadNotifications(regno);
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Notifications fetched successfully", notifications)
    );
});

const suggestedProfiles = asyncHandler(async (req, res) => {
  const regno = req?.user?.regno;
  if (!regno)
    return res.status(401).json(new ApiError("Unauthorized Request", 401));
  const followingList = await Follow.find({ regno: regno }).select("following");
  const followingIds = followingList.map((f) => f.following);

  const suggestedUsers = await User.aggregate([
    {
      $match: {
        _id: { $nin: [req.user._id, ...followingIds] },
        regno: { $nin: [1111111, 2010215,2010247] },
      },
    },
    { $sample: { size: 5 } },
    {
      $project: { fullName: 1, regno: 1, trade: 1, headLine: 1, avatarUrl: 1 },
    },
  ]);

  if (!suggestedUsers)
    return res
      .status(404)
      .json(new ApiError("No suggested profiles found", 404));
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Suggested profiles fetched successfully",
        suggestedUsers
      )
    );
});

const userProfileView = asyncHandler(async (req, res) => {
  const viewer = req?.user?.regno;
  const { regno } = req?.params;

  if (!regno)
    return res.status(400).json(new ApiError("Regno is mandatory", 400));

  if (!viewer)
    return res.status(401).json(new ApiError("Unauthorized Request", 401));

  const add = await redisClient.hSet(
    `profileView:${regno}`,
    viewer,
    Date.now().toString()
  );

  res.status(200).json(new ApiResponse(200, "profile viewed successfuly"));
});

const getProfileViews = asyncHandler(async (req, res) => {
  const regno = req?.user?.regno;
  if (!regno)
    return res.status(401).json(new ApiError("Unauthorized Request", 401));

  // if view time is greater that 24 hours delete the view and update the whole list
  let viewers = await redisClient.hGetAll(`profileView:${regno}`);
  const currentTime = Date.now();
  for (let viewer in viewers) {
    if (currentTime - viewers[viewer] > 86400000 * 7) {
      await redisClient.hDel(`profileView:${regno}`, viewer);
      viewers[viewer] = undefined;
    }
  }

  let users = Object.keys(viewers).filter((key) => viewers[key] !== undefined);

  users = await User.find({ regno: { $in: users } }).select(
    "fullName regno avatarUrl headLine"
  );

  users = users.map((user) => {
    return {
      ...user.toObject(),
      viewTime: viewers[user.regno],
    };
  });

  // sort by view time most rescent first
  users = users.sort((a, b) => b.viewTime - a.viewTime);


  return res
    .status(200)
    .json(new ApiResponse(200, "Profile views fetched successfully", users));
});

export {
  registerUser,
  generateOTP,
  loginUser,
  logoutUser,
  refreshTokenToAccessToken,
  getUserDetails,
  resetPassword,
  getMyProfile,
  editBasicInfo,
  editUserProfile,
  searchUsers,
  getNotifications,
  suggestedProfiles,
  userProfileView,
  getProfileViews,
};
