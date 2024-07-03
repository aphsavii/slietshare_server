import { redisClient } from "../connections/redisConnect.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { io } from "../app.js";
import { isUserActive, saveNotification, getUnreadNotifications,markNotificationsAsRead } from "./utils/index.js";
import { Notification } from "../utils/Notification.js";
import { User } from "../models/user.model.js";


const notificationEvents = async (socket) => {
try {
        const socketId = socket.id;
        const regno = socket.user.regno;
    
        socket.on('notification:set', async (data) => {
            const { to, type ,sender} = data;
            const notification = Notification(to, type);
            
            const message = {
                sender,
                message:notification,
            };
            await saveNotification(to, message);

            const receiver = await isUserActive(to);
            if(!receiver) return;
            console.log(message)
            io.to(receiver).emit('notification:new',  message );
        });
        socket.on("notification:markAsRead", async (data) => {
            const markAsRead = await markNotificationsAsRead(regno);
        });

} catch (error) {
    console.log(error)
}
   
}

export { notificationEvents };