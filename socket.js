const { Server } = require("socket.io");

let io;

// Called once when the server starts, attaches Socket.io to the existing HTTP server
const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Each logged-in user joins a private "room" named after their own user ID —
    // this lets us send a notification to ONE specific user, not everyone
    socket.on("join", (userId) => {
      socket.join(`user:${userId}`);
    });

    // Admins join a shared "admin" room so we can broadcast to all admins at once
    socket.on("joinAdmin", () => {
      socket.join("admins");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

// Lets any controller access the same io instance to emit events
const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initSocket, getIO };