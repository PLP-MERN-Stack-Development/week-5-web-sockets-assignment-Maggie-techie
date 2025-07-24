// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./uploads')){
    fs.mkdirSync('./uploads');
}

// Store connected users, messages, rooms, and typing users
const users = new Map();
const messages = new Map(); // Map of roomId -> messages array
const rooms = new Map(); // Map of roomId -> room info
const typingUsers = new Map(); // Map of roomId -> Set of typing users
const privateMessages = new Map(); // Map of conversationId -> messages array
const messageReactions = new Map(); // Map of messageId -> reactions
const unreadMessages = new Map(); // Map of userId -> Set of unread message IDs

// Default rooms
const defaultRooms = [
  { id: 'general', name: 'General', description: 'General discussion' },
  { id: 'random', name: 'Random', description: 'Random conversations' },
  { id: 'tech', name: 'Tech Talk', description: 'Technology discussions' }
];

// Initialize default rooms
defaultRooms.forEach(room => {
  rooms.set(room.id, { ...room, users: new Set() });
  messages.set(room.id, []);
  typingUsers.set(room.id, new Set());
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining with authentication
  socket.on('user_join', ({ username, avatar }) => {
    const user = {
      id: socket.id,
      username,
      avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=random`,
      joinedAt: new Date(),
      status: 'online'
    };
    
    users.set(socket.id, user);
    unreadMessages.set(socket.id, new Set());
    
    // Send user info back
    socket.emit('user_authenticated', user);
    
    // Broadcast updated user list
    io.emit('users_update', Array.from(users.values()));
    
    // Send available rooms
    socket.emit('rooms_list', Array.from(rooms.values()).map(room => ({
      ...room,
      users: Array.from(room.users),
      userCount: room.users.size
    })));
    
    console.log(`${username} joined the chat`);
  });

  // Handle joining a room
  socket.on('join_room', (roomId) => {
    const user = users.get(socket.id);
    if (!user) return;

    // Leave current rooms
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
        const roomData = rooms.get(room);
        if (roomData) {
          roomData.users.delete(socket.id);
        }
      }
    });

    // Join new room
    socket.join(roomId);
    user.currentRoom = roomId;
    
    const room = rooms.get(roomId);
    if (room) {
      room.users.add(socket.id);
      
      // Send room messages
      const roomMessages = messages.get(roomId) || [];
      socket.emit('room_messages', roomMessages.slice(-50)); // Last 50 messages
      
      // Notify room about new user
      socket.to(roomId).emit('user_joined_room', { user, roomId });
      
      // Update room users
      io.to(roomId).emit('room_users_update', Array.from(room.users).map(id => users.get(id)).filter(Boolean));
    }
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const user = users.get(socket.id);
    if (!user || !user.currentRoom) return;

    const message = {
      id: uuidv4(),
      content: messageData.content,
      sender: user.username,
      senderId: socket.id,
      senderAvatar: user.avatar,
      roomId: user.currentRoom,
      timestamp: new Date(),
      reactions: {},
      readBy: new Set([socket.id])
    };
    
    const roomMessages = messages.get(user.currentRoom) || [];
    roomMessages.push(message);
    messages.set(user.currentRoom, roomMessages);
    
    // Limit stored messages to prevent memory issues
    if (roomMessages.length > 1000) {
      roomMessages.shift();
    }
    
    // Add to unread for other users in room
    const room = rooms.get(user.currentRoom);
    if (room) {
      room.users.forEach(userId => {
        if (userId !== socket.id) {
          const userUnread = unreadMessages.get(userId) || new Set();
          userUnread.add(message.id);
          unreadMessages.set(userId, userUnread);
        }
      });
    }
    
    io.to(user.currentRoom).emit('new_message', message);
    
    // Send delivery confirmation
    socket.emit('message_delivered', { messageId: message.id });
  });

  // Handle typing indicator
  socket.on('typing_start', () => {
    const user = users.get(socket.id);
    if (!user || !user.currentRoom) return;
    
    const roomTyping = typingUsers.get(user.currentRoom) || new Set();
    roomTyping.add(socket.id);
    typingUsers.set(user.currentRoom, roomTyping);
    
    socket.to(user.currentRoom).emit('user_typing', { 
      userId: socket.id, 
      username: user.username,
      isTyping: true 
    });
  });

  socket.on('typing_stop', () => {
    const user = users.get(socket.id);
    if (!user || !user.currentRoom) return;
    
    const roomTyping = typingUsers.get(user.currentRoom) || new Set();
    roomTyping.delete(socket.id);
    typingUsers.set(user.currentRoom, roomTyping);
    
    socket.to(user.currentRoom).emit('user_typing', { 
      userId: socket.id, 
      username: user.username,
      isTyping: false 
    });
  });

  // Handle private messages
  socket.on('send_private_message', ({ recipientId, content }) => {
    const sender = users.get(socket.id);
    const recipient = users.get(recipientId);
    
    if (!sender || !recipient) return;

    const conversationId = [socket.id, recipientId].sort().join('_');
    const message = {
      id: uuidv4(),
      content,
      sender: sender.username,
      senderId: socket.id,
      senderAvatar: sender.avatar,
      recipientId,
      conversationId,
      timestamp: new Date(),
      isPrivate: true,
      readBy: new Set([socket.id])
    };
    
    const conversation = privateMessages.get(conversationId) || [];
    conversation.push(message);
    privateMessages.set(conversationId, conversation);
    
    // Add to recipient's unread
    const recipientUnread = unreadMessages.get(recipientId) || new Set();
    recipientUnread.add(message.id);
    unreadMessages.set(recipientId, recipientUnread);
    
    // Send to both sender and recipient
    socket.emit('private_message', message);
    socket.to(recipientId).emit('private_message', message);
  });

  // Handle message reactions
  socket.on('add_reaction', ({ messageId, reaction }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const messageReaction = messageReactions.get(messageId) || {};
    if (!messageReaction[reaction]) {
      messageReaction[reaction] = new Set();
    }
    
    messageReaction[reaction].add(socket.id);
    messageReactions.set(messageId, messageReaction);
    
    // Broadcast reaction update
    const room = user.currentRoom;
    if (room) {
      const reactionData = {};
      Object.keys(messageReaction).forEach(r => {
        reactionData[r] = Array.from(messageReaction[r]).map(id => users.get(id)?.username).filter(Boolean);
      });
      
      io.to(room).emit('reaction_update', { messageId, reactions: reactionData });
    }
  });

  // Handle message read receipts
  socket.on('mark_message_read', (messageId) => {
    const userUnread = unreadMessages.get(socket.id) || new Set();
    userUnread.delete(messageId);
    unreadMessages.set(socket.id, userUnread);
    
    socket.emit('message_read', { messageId });
  });

  // Handle file upload
  socket.on('send_file', (fileData) => {
    const user = users.get(socket.id);
    if (!user || !user.currentRoom) return;

    const message = {
      id: uuidv4(),
      type: 'file',
      fileName: fileData.fileName,
      fileUrl: fileData.fileUrl,
      fileSize: fileData.fileSize,
      sender: user.username,
      senderId: socket.id,
      senderAvatar: user.avatar,
      roomId: user.currentRoom,
      timestamp: new Date(),
      reactions: {},
      readBy: new Set([socket.id])
    };
    
    const roomMessages = messages.get(user.currentRoom) || [];
    roomMessages.push(message);
    messages.set(user.currentRoom, roomMessages);
    
    io.to(user.currentRoom).emit('new_message', message);
  });

  // Handle creating new room
  socket.on('create_room', ({ name, description, isPrivate = false }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const roomId = uuidv4();
    const room = {
      id: roomId,
      name,
      description,
      createdBy: user.username,
      createdAt: new Date(),
      users: new Set([socket.id]),
      isPrivate
    };
    
    rooms.set(roomId, room);
    messages.set(roomId, []);
    typingUsers.set(roomId, new Set());
    
    // Join the creator to the room
    socket.join(roomId);
    user.currentRoom = roomId;
    
    // Broadcast new room to all users if not private
    if (!isPrivate) {
      io.emit('new_room', {
        ...room,
        users: Array.from(room.users),
        userCount: room.users.size
      });
    }
    
    socket.emit('room_created', roomId);
  });

  // Handle user status change
  socket.on('status_change', (status) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    user.status = status;
    io.emit('user_status_update', { userId: socket.id, status });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    
    if (user) {
      // Remove from all rooms
      rooms.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id);
          socket.to(roomId).emit('user_left_room', { user, roomId });
        }
      });
      
      // Remove from typing users
      typingUsers.forEach((roomTyping, roomId) => {
        if (roomTyping.has(socket.id)) {
          roomTyping.delete(socket.id);
          socket.to(roomId).emit('user_typing', { 
            userId: socket.id, 
            username: user.username,
            isTyping: false 
          });
        }
      });
      
      console.log(`${user.username} disconnected`);
    }
    
    users.delete(socket.id);
    unreadMessages.delete(socket.id);
    
    // Broadcast updated user list
    io.emit('users_update', Array.from(users.values()));
  });
});

// API routes
app.get('/api/messages/:roomId', (req, res) => {
  const { roomId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  const roomMessages = messages.get(roomId) || [];
  const startIndex = Math.max(0, roomMessages.length - (page * limit));
  const endIndex = roomMessages.length - ((page - 1) * limit);
  
  res.json({
    messages: roomMessages.slice(startIndex, endIndex),
    hasMore: startIndex > 0,
    total: roomMessages.length
  });
});

app.get('/api/private-messages/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const conversation = privateMessages.get(conversationId) || [];
  res.json(conversation);
});

app.get('/api/users', (req, res) => {
  res.json(Array.from(users.values()));
});

app.get('/api/rooms', (req, res) => {
  const roomsList = Array.from(rooms.values()).map(room => ({
    ...room,
    users: Array.from(room.users),
    userCount: room.users.size
  }));
  res.json(roomsList);
});

app.get('/api/unread/:userId', (req, res) => {
  const { userId } = req.params;
  const unread = unreadMessages.get(userId) || new Set();
  res.json({ count: unread.size, messages: Array.from(unread) });
});

// File upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    fileName: req.file.originalname,
    fileUrl: `/uploads/${req.file.filename}`,
    fileSize: req.file.size
  });
});

// Search messages route
app.get('/api/search', (req, res) => {
  const { query, roomId } = req.query;
  
  if (!query) {
    return res.json([]);
  }
  
  let searchResults = [];
  
  if (roomId) {
    const roomMessages = messages.get(roomId) || [];
    searchResults = roomMessages.filter(message => 
      message.content && message.content.toLowerCase().includes(query.toLowerCase())
    );
  } else {
    // Search all rooms
    messages.forEach((roomMessages) => {
      const matches = roomMessages.filter(message => 
        message.content && message.content.toLowerCase().includes(query.toLowerCase())
      );
      searchResults.push(...matches);
    });
  }
  
  res.json(searchResults.slice(0, 100)); // Limit to 100 results
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    users: users.size,
    rooms: rooms.size,
    uptime: process.uptime()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Default rooms initialized: ${Array.from(rooms.keys()).join(', ')}`);
});

module.exports = { app, server, io }; 