import 'reflect-metadata';
import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';               
import { Server as SocketServer } from 'socket.io'; 
import { AppDataSource } from './database/data-source';
import { registerRoutes } from './index.routes';
import path from 'path';
import cookieParser from 'cookie-parser';

const app: Express = express();
const httpServer = createServer(app);              
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Register all routes with /hiworld/api prefix
registerRoutes(app);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ---------- SOCKET.IO INITIALIZATION ----------
const io = new SocketServer(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || '*', credentials: true }
});

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId; // client must send { auth: { userId } }
  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} connected`);
  }
  socket.on('disconnect', () => {
    console.log(`User disconnected`);
  });
});

// Export io so other modules can emit events
export { io };
// ---------------------------------------------

// Start server
const startServer = async () => {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    httpServer.listen(PORT, () => {
      console.log(`
   hiWorld Server Running             
  ➜ Local:   http://localhost:${PORT}   
  ➜ API:     http://localhost:${PORT}/api 
  ➜ Health:  http://localhost:${PORT}/api/health 
  ➜ WebSocket: active
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;