const Notification = require('../models/Notification');

let io;

const setIO = (socketIO) => {
  io = socketIO;
};

const createNotification = async ({ recipient, sender, type, title, message, link, metadata }) => {
  try {
    const notification = await Notification.create({
      recipient, sender, type, title, message, link, metadata,
    });

    if (io) {
      io.to(`user:${recipient.toString()}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    // Notification failure should never break the main request
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

module.exports = { setIO, createNotification };
