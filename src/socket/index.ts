import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';

let io: SocketServer;

export function initSocket(server: Server) {
  io = new SocketServer(server, {
    cors: { origin: process.env.CORS_ORIGIN || '*' }
  });
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    if (userId) socket.join(`user:${userId}`);
    socket.on('disconnect', () => {});
  });
}

export function emitNewMessage(receiverId: string, message: any) {
  if (io) io.to(`user:${receiverId}`).emit('new_message', message);
}