import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const socketJwt = async (socket, next) => {
  const accessToken =
    socket?.cookies?.accessToken ||
    socket?.handshake?.auth?.accessToken?.replace("Bearer ", "");
  if (!accessToken) return;
  const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    if (!decodedToken) return;

  socket.user = decodedToken;
  next();
};

export { socketJwt };
