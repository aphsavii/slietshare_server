import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

import { createPost,
         deletePost,
         postsByUser,
         getRecommendedPost,
         unlikePost,
         deleteComment,
         getPostById
 } from "../controllers/post.controller.js";

const postRouter = Router();

postRouter.put("/create", verifyJwt, upload.fields([{name:"media",maxCount:1}]) , createPost);
postRouter.delete("/delete/:id", verifyJwt, deletePost);
postRouter.get("/user/:regno", verifyJwt, postsByUser);
postRouter.get("/feed",verifyJwt,getRecommendedPost);
postRouter.get("/:id",verifyJwt,getPostById);
postRouter.delete("/unlike/:postId", verifyJwt, unlikePost);
postRouter.delete("/comment/:commentId", verifyJwt, deleteComment);

export { postRouter };