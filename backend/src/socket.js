const { verifyAccessToken } = require('./utils/jwt');
const User = require('./models/User');

const initSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('name email avatar');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Socket connected: ${socket.user.name} (${socket.id})`);
    }

    // Join personal room for notifications
    socket.join(`user:${socket.user._id}`);

    // Join board room
    socket.on('join:board', (boardId) => {
      socket.join(`board:${boardId}`);
      socket.to(`board:${boardId}`).emit('user:joined', {
        userId: socket.user._id,
        name: socket.user.name,
        avatar: socket.user.avatar,
      });
    });

    // Leave board room
    socket.on('leave:board', (boardId) => {
      socket.leave(`board:${boardId}`);
      socket.to(`board:${boardId}`).emit('user:left', { userId: socket.user._id });
    });

    // Join project room
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    // Typing indicator
    socket.on('typing:start', ({ boardId, taskId }) => {
      socket.to(`board:${boardId}`).emit('typing:start', {
        userId: socket.user._id,
        name: socket.user.name,
        taskId,
      });
    });

    socket.on('typing:stop', ({ boardId, taskId }) => {
      socket.to(`board:${boardId}`).emit('typing:stop', {
        userId: socket.user._id,
        taskId,
      });
    });

    socket.on('disconnect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Socket disconnected: ${socket.user.name}`);
      }
    });
  });
};

module.exports = initSocket;
