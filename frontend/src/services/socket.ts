import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const createSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  if (socket) {
    socket.disconnect();
  }
  
  socket = io('http://localhost:3000', {
    auth: {
      token: token
    }
  });
  
  return socket;
};

export const getSocket = () => socket;

export default { createSocket, getSocket };