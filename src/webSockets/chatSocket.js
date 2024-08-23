import { io } from "../app.js";
import { redisClient } from "../connections/redisConnect.js";
import { isUserActive } from "./utils/index.js";
import { Message } from "../utils/Message.js";

const chatEvents = async (socket) => {
  const socketId = socket.id;
  const regno = socket.user.regno;
  const userId = socket.user._id;

  socket.on("message:send", async (data) => {
    const { to, content, sender, timestamp } = data;
    if (!to || !content || !sender || !timestamp) {
      return;
    }
    const toUser = await isUserActive(to);
    const message = Message({ content, to, sender, timestamp });

    // send message to user
    if (toUser) {
      io.to(toUser).emit("message:received", message);
    }

    // console.log(message);

    // save message
    await redisClient.hSet(`message:${message.messageId}`, {
      to: to,
      content: content,
      timestamp: timestamp,
      messageId: message.messageId,
    });
    await redisClient.expire(`message:${message.messageId}`, 60 * 60 * 24 * 7);

    // message queue
    await redisClient.rPush(
      `conversation:${sender.regno}-${to}`,
      message.messageId
    );
    await redisClient.rPush(
      `conversation:${to}-${sender.regno}`,
      message.messageId
    );

    // recent chats
    await redisClient.lRem(
      `recent:${sender.regno}`,
      1,
      `conversation:${sender.regno}-${to}`
    );
    await redisClient.rPush(
      `recent:${sender.regno}`,
      `conversation:${sender.regno}-${to}`
    );
    await redisClient.lRem(
      `recent:${to}`,
      1,
      `conversation:${to}-${sender.regno}`
    );
    await redisClient.rPush(
      `recent:${to}`,
      `conversation:${to}-${sender.regno}`
    );

    // isRead
    await redisClient.hSet(
      `conversation:isRead`,
      `conversation:${sender.regno}-${to}`,
      "false"
    );
  });

  socket.on("message:Delete", async (data) => {
    const { messageId, to } = data;
    await redisClient.del(`message:${messageId}`);
    await redisClient.lRem(`conversation:${regno}-${to}`, 1, messageId);
    await redisClient.lRem(`conversation:${to}-${regno}`, 1, messageId);
  });

  socket.on("conversation:read", async (data) => {
    const to  = data;
    const user = await isUserActive(to);
    if(user)
      io.to(user).emit("chat:seen", regno);
    await redisClient.hSet(
      `conversation:isRead`,
      `conversation:${to}-${regno}`,
      "true"
    );
    await redisClient.hSet(
      `conversation:isRead`,
      `conversation:${regno}-${to}`,
      "true"
    );
  });
};
export { chatEvents };
