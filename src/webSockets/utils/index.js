import { redisClient } from "../../connections/redisConnect.js";

const setActiveUser = async (socketId, regno) => {
  try {
    const setActiveUser = redisClient.hSet("activeUsers", regno, socketId);
  } catch (error) {
    console.log(error);
  }
};

const isUserActive = async (regno) => {
  try {
    const activeUser = await redisClient.hGet("activeUsers", regno);
    return activeUser;
  } catch (error) {
    console.log(error);
  }
};

const removeActiveUser = async (regno) => {
  try {
    const removeActiveUser = await redisClient.hDel("activeUsers", regno.toString());
    return removeActiveUser;
  } catch (error) {
    console.log('error');
    console.log(error);
  }
};

const saveNotification = async (regno, notification) => {
  try {
    console.log(notification);
   await redisClient.hSet(
      `notifications:unread:${regno}`,
      notification?.timestamp.toString(),
      JSON.stringify(notification)
    );
    }
    catch (error) {
    console.log(error);
    }
};

const getUnreadNotifications = async (regno) => {
  try {
    const notifications = await redisClient.hGetAll(`notifications:unread:${regno}`);
    return notifications;
  } catch (error) {
    console.log(error);
  }
};

const markNotificationsAsRead = async (notifications) => {
    try {
        const keys = Object.keys(notifications);
        const markAsRead = await redisClient.hDel(`notifications:unread:${regno}`, ...keys);
        const read = await redisClient.hSet(`notifications:read:${regno}`, ...keys);
        return markAsRead;  
    } catch (error) {
        console.log(error);
    }
};

const getAllNotifications = async (regno) => {
    try {
        const unread = await redisClient.hGetAll(`notifications:unread:${regno}`);
        const read = await redisClient.hGetAll(`notifications:read:${regno}`);
        return {unread, read};
    } catch (error) {
        console.log(error);
    }
}


export { setActiveUser, isUserActive, removeActiveUser,saveNotification,getUnreadNotifications,markNotificationsAsRead,getAllNotifications };
