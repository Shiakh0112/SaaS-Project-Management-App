import { io } from 'socket.io-client';
import { store } from '../app/store';
import {
  socketTaskCreated, socketTaskUpdated,
  socketTaskDeleted, socketTaskMoved,
} from '../app/slices/taskSlice';
import { addNotification } from '../app/slices/notificationSlice';

let socket = null;

export const connectSocket = () => {
  const token = store.getState().auth.accessToken;
  if (!token || socket?.connected) return;

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => console.log('Socket connected'));
  socket.on('disconnect', () => console.log('Socket disconnected'));

  socket.on('task:created', (task) => store.dispatch(socketTaskCreated(task)));
  socket.on('task:updated', (task) => store.dispatch(socketTaskUpdated(task)));
  socket.on('task:deleted', (data) => store.dispatch(socketTaskDeleted(data)));
  socket.on('task:moved', (task) => store.dispatch(socketTaskMoved(task)));
  socket.on('notification', (notif) => store.dispatch(addNotification(notif)));
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinBoard = (boardId) => socket?.emit('join:board', boardId);
export const leaveBoard = (boardId) => socket?.emit('leave:board', boardId);
export const joinProject = (projectId) => socket?.emit('join:project', projectId);
export const emitTypingStart = (boardId, taskId) => socket?.emit('typing:start', { boardId, taskId });
export const emitTypingStop = (boardId, taskId) => socket?.emit('typing:stop', { boardId, taskId });

export const getSocket = () => socket;
