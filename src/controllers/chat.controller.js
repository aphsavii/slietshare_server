import { redisClient } from "../connections/redisConnect.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
/**
 * { conversationId,
 * lastMessage,
 *
 *
 * }
 *  **/

const getRecentChats = asyncHandler(async (req, res) => {
  if (!req.user)
    return res.status(401).json(new ApiError(401, "Unauthorized request"));
  const regno = req.user.regno;
  const recentChats = await redisClient.lRange(`recent:${regno}`, 0, -1);

  let chats = [];
  for (let chat of recentChats) {
    // console.log(chat);
    const regno = +chat.split('-')[1];
    const user = await User.findOne({ regno }).select("name fullName regno avatarUrl");
    const isRead = await redisClient.hGet(`conversation:isRead`, `conversation:${regno}-${req.user.regno}`);
    const isUnreadMessages = isRead == "false" ? true : false;
    const lastMessageId = await redisClient.lIndex(chat, -1);
    const lastMessage = await redisClient.hGetAll(`message:${lastMessageId}`);
    chats.push({ lastMessage, conversationId: chat, regno,avatarUrl:user.avatarUrl,fullName:user.fullName, isUnreadMessages });
  }
  
  res
    .status(200)
    .json(new ApiResponse(200, "recent chats fetched sucessfully", chats.reverse()));
});

const getConversation = asyncHandler(async (req, res) => {
  const { regno } = req.user;
  const to = req.params.regno;
  const conversationId = `conversation:${regno}-${to}`;
  const isRead = await redisClient.hGet(`conversation:isRead`, conversationId);
  const messages = await redisClient.lRange(conversationId, 0, -1);
  let conversation = [];
  for (let messageId of messages) {
    const messageData = await redisClient.hGetAll(`message:${messageId}`);
    if(messageData.timestamp)
    conversation.push(messageData);
  }

  res.status(200).json(new ApiResponse(200, "conversation fetched", {conversation, isRead}));
});

export { getRecentChats, getConversation };
