import { redisClient } from "../connections/redisConnect.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { io } from "../app.js";
import { isUserActive, saveNotification, getAllNotifications, getUnreadNotifications } from "./utils/index.js";
import { Notification } from "../utils/Notification.js";
import { User } from "../models/user.model.js";


const notificationEvents = async (socket) => {
try {
        const socketId = socket.id;
        const regno = socket.user.regno;
    
        socket.on('notification:set', async (data) => {
            const { to, type } = data;
            const notification = Notification(to, type);
            
            await saveNotification(to, notification);

            const receiver = await isUserActive(to);
            if(!receiver) return;

            const sender = User.findOne({regno}).select('fullName, avatarUrl, regno, trade, batch');
            
            const message = {
                sender,
                notification,
            };
            io.to(receiver).emit('notification:new',  message.toString() );
        });


} catch (error) {
    console.log(error)
}
   
}

export { notificationEvents };