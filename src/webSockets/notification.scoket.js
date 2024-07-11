import { io } from "../app.js";
import {
  isUserActive,
  saveNotification,
  markNotificationsAsRead,
} from "./utils/index.js";
import { Notification } from "../utils/Notification.js";
import Like from "../models/like.modal.js";
import Comment from "../models/comment.modal.js";

const notificationEvents = async (socket) => {
  try {
    const socketId = socket.id;
    const regno = socket.user.regno;
    const userId = socket.user._id;
    // Set Notification or emit notification from client
    socket.on("notification:set", async (data) => {
      const { to, type, sender } = data;
      const notification = Notification(to, type);

      const message = {
        sender,
        message: notification,
      };
      await saveNotification(to, message);

      const receiver = await isUserActive(to);
      if (!receiver) return;
      io.to(receiver).emit("notification:new", message);
    });

    // Mark notification as Read
    socket.on("notification:markAsRead", async (data) => {
      const markAsRead = await markNotificationsAsRead(regno);
    });

    // Like notification
    socket.on("post:like", async (data) => {
      const { to, postId, sender } = data;
      const notification = Notification(regno, "like");
      const message = {
        sender,
        message: notification,
      };
      const isLiked = await Like.findOne({ user: userId, post:postId });
      if (isLiked) return;

      await Like.create({ post: postId, user: userId });
      if (regno == to) return;
      await saveNotification(to, message);
      const receiver = await isUserActive(to);
      if (!receiver) return;
      io.to(receiver).emit("notification:new", message);
    });

    // Comment notification
    socket.on("post:comment", async (data) => {
      const { to, postId, sender, content } = data;
      const notification = Notification(regno, "comment");
      const message = {
        sender,
        message: notification,
      };
      await Comment.create({ post: postId, user: userId, content });
      await saveNotification(to, message);
      const receiver = await isUserActive(to);
      if (!receiver) return;
      io.to(receiver).emit("notification:new", message);
    });
  } catch (error) {
    console.log(error);
  }
};

export { notificationEvents };
