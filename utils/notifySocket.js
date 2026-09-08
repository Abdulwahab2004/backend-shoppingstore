const axios = require("axios");

const notifySocket = async (room, event, payload) => {
  try {
    await axios.post(`${process.env.SOCKET_SERVER_URL}/emit`, {
      secret: process.env.INTERNAL_SECRET,
      room,
      event,
      payload,
    });
  } catch (err) {
    console.error("Failed to notify socket server:", err.message);
  }
};

module.exports = notifySocket;