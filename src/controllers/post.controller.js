import { asyncHandler } from "../utils/AsyncHandler.js";
import Post from "../models/post.modal.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { convertToWebp } from "../utils/convertToWebp.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";
import Like from "../models/like.modal.js";
import Comment from "../models/comment.modal.js";
import mongoose from "mongoose";

const createPost = asyncHandler(async (req, res) => {
  const { title, tags } = req.body;
  const user = req.user;

  if (!title)
    return res
      .status(400)
      .json(new ApiError("Title is required", 400, ["Title is required"]));

  if (
    !req.files &&
    !Array.isArray(req.files.media) &&
    req.files.media.length === 0
  )
    return res.status(400).json(new ApiError("Please upload a file", 400));

  const localMediaUrl = req.files.media[0].path;
  const webPUrl = await convertToWebp(localMediaUrl, 100);
  const uploadedUrl = await uploadOnCloudinary(webPUrl);
  if (!uploadedUrl)
    return res
      .status(500)
      .json(
        new ApiError("Something went wrong", 500, [
          "Error uploading image on cloudinary server ",
        ])
      );

  const newPost = await Post.create({
    title,
    tags,
    mediaUrl: [uploadedUrl],
    createdBy: user._id,
  });

  return res.status(201).json(new ApiResponse(201, "Post created", newPost));
});

const deletePost = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  if (!id)
    return res
      .status(400)
      .json(new ApiError("Id is required", 400, ["Id is required"]));

  const post = await Post.findByIdAndDelete(id);
  if (!post)
    return res
      .status(404)
      .json(new ApiError("Post not found", 404, ["Post not found"]));
  if (post.createdBy.toString() !== user._id.toString())
    return res
      .status(403)
      .json(
        new ApiError("You are not authorized to delete this post", 403, [
          "You are not authorized to delete this post",
        ])
      );

  return res.status(200).json(new ApiResponse(200, "Post deleted", post));
});

const postsByUser = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  if (!page || !limit)
    return res
      .status(400)
      .json(
        new ApiError("Page and limit is required", 400, [
          "Page and limit are required",
        ])
      );
  const skip = (page - 1) * limit;
  const userId = req.params.id;
  if (!userId)
    return res
      .status(400)
      .json(new ApiError("User id is required", 400, ["User id is required"]));

  const posts = await Post.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(userId),
        status: "active",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $project: {
        title: 1,
        mediaUrl: 1,
        tags: 1,
        createdAt: 1,
        createdBy: {
          $arrayElemAt: ["$createdBy", 0],
        },
      },
    },
    {
      $project: {
        title: 1,
        mediaUrl: 1,
        tags: 1,
        createdAt: 1,
        "createdBy._id": 1,
        "createdBy.fullName": 1,
        "createdBy.regno": 1,
        "createdBy.trade": 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, "Posts Fetched successfully", posts));
});

const getRecommendedPost = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = +req.query.limit || 10;
  const skip = (page - 1) * limit;
  const posts = await Post.aggregate([
    {
      $match: {
        status: "active",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: "$createdBy",
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "post",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        isLiked: {
          $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.user"],
        },
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "post",
        as: "comments",
      },
    },
    {
      $addFields: {
        commentsCount: {
          $size: "$comments",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "comments.user",
        foreignField: "_id",
        as: "commentUsers",
      },
    },
    {
      $addFields: {
        comments: {
          $map: {
            input: "$comments",
            as: "comment",
            in: {
              $mergeObjects: [
                "$$comment",
                {
                  userDetails: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$commentUsers",
                          cond: { $eq: ["$$this._id", "$$comment.user"] },
                        },
                      },
                      0,
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        sortedComments: {
          $sortArray: {
            input: "$comments",
            sortBy: { createdAt: -1 },
          },
        },
      },
    },
    {
      $project: {
        title: 1,
        mediaUrl: 1,
        tags: 1,
        createdAt: 1,
        likesCount: 1,
        commentsCount: 1,
        isLiked: 1,
        shares: 1,
        createdBy: {
          _id: 1,
          fullName: 1,
          regno: 1,
          trade: 1,
          avatarUrl: 1,
          headLine: 1,
        },
        comments: {
          $map: {
            input: "$sortedComments",
            as: "comment",
            in: {
              _id: "$$comment._id",
              content: "$$comment.content",
              createdAt: "$$comment.createdAt",
              userDetails: {
                _id: "$$comment.userDetails._id",
                fullName: "$$comment.userDetails.fullName",
                avatarUrl: "$$comment.userDetails.avatarUrl",
                regno: "$$comment.userDetails.regno",
                headLine: "$$comment.userDetails.headLine",
              },
            },
          },
        },
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, "Posts Fetched successfully", posts));
});

// post unlike
const unlikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const unliked = await Like.findOneAndDelete({ post: postId, user: userId });
  if (!unliked) {
    return res
      .status(404)
      .json(new ApiError("Post not found", 404, ["Post not found"]));
  }
  return res.status(200).json(new ApiResponse(200, "Post unliked"));
});

// post delete comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.userId;

  const deleted = await Comment.findByIdAndDelete(commentId);
  if (!deleted) {
    return res
      .status(404)
      .json(new ApiError("Comment not found", 404, ["Comment not found"]));
  }
  return res.status(200).json(new ApiResponse(200, "Comment deleted"));
});

const getPostById = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const post = await Post.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(postId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: "$createdBy",
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "post",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        isLiked: {
          $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.user"],
        },
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "post",
        as: "comments",
      },
    },
    {
      $addFields: {
        commentsCount: {
          $size: "$comments",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "comments.user",
        foreignField: "_id",
        as: "commentUsers",
      },
    },
    {
      $addFields: {
        comments: {
          $map: {
            input: "$comments",
            as: "comment",
            in: {
              $mergeObjects: [
                "$$comment",
                {
                  userDetails: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$commentUsers",
                          cond: { $eq: ["$$this._id", "$$comment.user"] },
                        },
                      },
                      0,
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        sortedComments: {
          $sortArray: {
            input: "$comments",
            sortBy: { createdAt: -1 },
          },
        },
      },
    },
    {
      $project: {
        title: 1,
        mediaUrl: 1,
        tags: 1,
        createdAt: 1,
        likesCount: 1,
        commentsCount: 1,
        isLiked: 1,
        shares: 1,
        createdBy: {
          _id: 1,
          fullName: 1,
          regno: 1,
          trade: 1,
          avatarUrl: 1,
          headLine: 1,
        },
        comments: {
          $map: {
            input: "$sortedComments",
            as: "comment",
            in: {
              _id: "$$comment._id",
              content: "$$comment.content",
              createdAt: "$$comment.createdAt",
              userDetails: {
                _id: "$$comment.userDetails._id",
                fullName: "$$comment.userDetails.fullName",
                avatarUrl: "$$comment.userDetails.avatarUrl",
                regno: "$$comment.userDetails.regno",
                headLine: "$$comment.userDetails.headLine",
              },
            },
          },
        },
      },
    },
  ]);
  if (post.length === 0)
    return res
      .status(404)
      .json(new ApiError("Post not found", 404, ["Post not found"]));
  return res
    .status(200)
    .json(new ApiResponse(200, "Post fetched successfully", post[0]));
});

export {
  createPost,
  deletePost,
  postsByUser,
  getRecommendedPost,
  unlikePost,
  deleteComment,
  getPostById,
};
