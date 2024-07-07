import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

import { createPost,
         deletePost,
         postsByUser
 } from "../controllers/post.controller.js";

const postRouter = Router();

postRouter.put("/create", verifyJwt, upload.fields([{name:"media",maxCount:1}]) , createPost);
postRouter.delete("/delete/:id", verifyJwt, deletePost);
postRouter.get("/user/:id", verifyJwt, postsByUser);

export { postRouter };