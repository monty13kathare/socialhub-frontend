import { io, Socket } from "socket.io-client";

// const URL = "http://localhost:5000";
const URL = "https://socialhub-backend-3.onrender.com";

// ✅ ROOT URL

export const socket: Socket = io(URL, {
  autoConnect: false,          // connect manually
  transports: ["websocket"],  // faster, stable
  withCredentials: true,
});
