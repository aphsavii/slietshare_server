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
    const activeUser = await redisClient.hGet("activeUsers", regno.toString());
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
   await redisClient.hSet(
      `notifications:unread:${regno}`,
      notification?.message?.timestamp.toString(),
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
    let notificationsArray = Object.values(notifications);
    notificationsArray = notificationsArray.map((notification) => JSON.parse(notification));
    return notificationsArray;
  } catch (error) {
    console.log(error);
  }
};

const markNotificationsAsRead = async (regno) => {
    try {
        const markAsRead = await redisClient.del(`notifications:unread:${regno}`);
        return markAsRead;  
    } catch (error) {
        console.log(error);
    }
};


export { setActiveUser, isUserActive, removeActiveUser,saveNotification,getUnreadNotifications,markNotificationsAsRead };
