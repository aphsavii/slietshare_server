import { notificationEvents } from "./notification.scoket.js";
import { chatEvents } from "./chatSocket.js";

const socketEvents = (socket) => {
        notificationEvents(socket);
        chatEvents(socket);
};  

export { socketEvents };