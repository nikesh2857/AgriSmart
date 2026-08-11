import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import prisma from './prisma';

let io: SocketIOServer;

// Map userId -> socket.id for targeted delivery
const userSocketMap = new Map<string, string>();

export const initSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Client authenticates with their userId
    socket.on('register', (userId: string) => {
      if (userId) {
        userSocketMap.set(userId, socket.id);
        console.log(`[Socket.IO] User ${userId} registered on socket ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, sockId] of userSocketMap.entries()) {
        if (sockId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });

    // Worker tracking listener
    socket.on('worker_ping', async (data: { userId: string, jobId: string, lat: number, lng: number }) => {
      if (data.userId && data.jobId) {
        try {
          const getRedis = (await import('./redis')).default;
          const redis = getRedis();
          const key = `worker_loc:${data.userId}`;
          await redis.setex(key, 300, JSON.stringify({ lat: data.lat, lng: data.lng, timestamp: new Date().toISOString() }));
          
          // Optionally broadcast to farmer
          const getIO = (await import('./socket')).getIO;
          const io = getIO();
          io.to(`job:${data.jobId}`).emit('worker_location_update', data);
        } catch (error) {
          console.error('[Socket.IO] Failed to cache worker location:', error);
        }
      }
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) throw new Error('Socket.IO not initialized. Call initSocket first.');
  return io;
};

/**
 * Persist a notification in DB and emit to the user's socket if online.
 */
export const sendNotification = async (userId: string, title: string, body: string) => {
  try {
    await prisma.notification.create({ data: { userId, title, body } });

    const socketId = userSocketMap.get(userId);
    if (socketId && io) {
      io.to(socketId).emit('notification', { title, body });
    }
  } catch (err) {
    console.error('[Notification] Failed to send:', err);
  }
};
