import 'dotenv/config';
import express, { Express } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import resourceRoutes from './routes/resources';
import bookmarkRoutes from './routes/bookmarks';
import analyticsRoutes from './routes/analytics';
import userRoutes from './routes/users';
import chatRoutes from './routes/chat';
import { standardRateLimit } from './middleware/rateLimitMiddleware';
import { checkBlocked, detectSuspiciousActivity } from './middleware/securityMiddleware';
import cookieParser from 'cookie-parser';
import { redisClient } from './config/redis';
import User from './models/User';

const app: Express = express();
const server = createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
    credentials: true 
  } 
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(checkBlocked);
app.use(detectSuspiciousActivity);
app.use(standardRateLimit);

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO for real-time chat
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('user_online', async (userId) => {
    connectedUsers.set(socket.id, userId);
    
    // Update user online status
    try {
      await User.findByIdAndUpdate(userId, { 
        isOnline: true, 
        lastSeen: new Date() 
      });
      
      // Broadcast online users count
      io.emit('online_users_count', connectedUsers.size);
      
      // Get recent chat messages from Redis
      const messages = await redisClient.lRange('chat_messages', 0, 49);
      const parsedMessages = messages.reverse().map(msg => JSON.parse(msg));
      socket.emit('chat_history', parsedMessages);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  });
  
  socket.on('join_private_chat', (userId) => {
    socket.join(`user_${userId}`);
  });
  
  socket.on('private_message', async (data) => {
    const { senderId, senderName, recipientId, message } = data;
    
    const chatMessage = {
      _id: Date.now().toString(),
      sender: senderId,
      senderName,
      recipient: recipientId,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    try {
      // Create chat ID (consistent ordering)
      const chatId = [senderId, recipientId].sort().join('_');
      
      // Store message in Redis
      await redisClient.lPush(`chat_messages:${chatId}`, JSON.stringify(chatMessage));
      await redisClient.lTrim(`chat_messages:${chatId}`, 0, 999); // Keep last 1000 messages
      
      // Send to both users
      io.to(`user_${senderId}`).emit('private_message', chatMessage);
      io.to(`user_${recipientId}`).emit('private_message', chatMessage);
    } catch (error) {
      console.error('Error storing private message:', error);
    }
  });
  
  socket.on('typing_private', (data) => {
    const { userId, userName, chatId } = data;
    socket.broadcast.emit('user_typing_private', { userId, userName, chatId });
  });
  
  socket.on('stop_typing_private', (data) => {
    const { userId, userName, chatId } = data;
    socket.broadcast.emit('user_stop_typing_private', { userId, userName, chatId });
  });
  
  socket.on('chat_message', async (data) => {
    const { userId, message, userName } = data;
    
    const chatMessage = {
      id: Date.now().toString(),
      userId,
      userName,
      message,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Store in Redis (keep last 100 messages)
      await redisClient.lPush('chat_messages', JSON.stringify(chatMessage));
      await redisClient.lTrim('chat_messages', 0, 99);
      
      // Broadcast to all connected clients
      io.emit('new_message', chatMessage);
    } catch (error) {
      console.error('Error storing chat message:', error);
    }
  });
  
  socket.on('typing', (data) => {
    socket.broadcast.emit('user_typing', data);
  });
  
  socket.on('stop_typing', (data) => {
    socket.broadcast.emit('user_stop_typing', data);
  });
  
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { 
          isOnline: false, 
          lastSeen: new Date() 
        });
      } catch (error) {
        console.error('Error updating user offline status:', error);
      }
    }
    
    connectedUsers.delete(socket.id);
    io.emit('online_users_count', connectedUsers.size);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export { app };