import { getRecentChats } from "../controllers/chat.controller.js";
import { getConversation } from "../controllers/chat.controller.js";
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const chatRouter = Router();

chatRouter.get("/recent",verifyJwt, getRecentChats);
chatRouter.get("/conversation/:regno", verifyJwt,getConversation);

export { chatRouter };