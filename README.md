[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19962251&assignment_repo_type=AssignmentRepo)

# 🚀 Real-Time Chat Application with Socket.io

A feature-rich, real-time chat application built with **React**, **Node.js**, **Express**, and **Socket.io**. This application demonstrates modern web development practices and real-time communication capabilities.

![Chat App Demo](https://img.shields.io/badge/Status-Live-green)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)
![React](https://img.shields.io/badge/React-18-blue)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-red)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [API Documentation](#-api-documentation)
- [Socket Events](#-socket-events)
- [Advanced Features](#-advanced-features)
- [Performance Optimizations](#-performance-optimizations)
- [Assignment Completion](#-assignment-completion)

## ✨ Features

### 🔥 Core Features
- **Real-time messaging** with instant delivery
- **User authentication** with profile avatars
- **Multiple chat rooms** with room management
- **Private messaging** between users
- **Online/offline status** indicators
- **Typing indicators** showing who's typing
- **Message reactions** (👍, ❤️, 😊, etc.)
- **File sharing** (images, documents)
- **Emoji picker** for expressive communication
- **Message timestamps** with smart formatting
- **Responsive design** for all devices

### 🚀 Advanced Features
- **Message read receipts** and delivery confirmations
- **Real-time notifications** (browser and in-app)
- **Automatic reconnection** with connection status
- **Message search** across rooms
- **Room creation** with public/private options
- **Message pagination** for performance
- **Sound notifications** for new messages
- **Drag & drop file upload**
- **Connection persistence** across browser sessions
- **Mobile-responsive** interface

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **React Icons** - Beautiful icon library
- **React Toastify** - Notification system
- **Date-fns** - Date formatting utilities
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation
- **dotenv** - Environment variable management

## 📁 Project Structure

```
socketio-chat/
├── client/                 # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ChatRoom.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── UserList.jsx
│   │   │   ├── PrivateChat.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── EmojiPicker.jsx
│   │   │   └── CreateRoomModal.jsx
│   │   ├── context/        # React context providers
│   │   │   └── SocketContext.jsx
│   │   ├── pages/          # Main page components
│   │   │   ├── LoginPage.jsx
│   │   │   └── ChatPage.jsx
│   │   ├── socket/         # Socket.io configuration
│   │   │   └── socket.js
│   │   ├── App.jsx         # Main application component
│   │   ├── main.jsx        # Application entry point
│   │   └── index.css       # Global styles
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   └── .env                # Environment variables
├── server/                 # Node.js backend
│   ├── uploads/            # File upload directory
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment variables
├── README.md               # This file
└── Week5-Assignment.md     # Assignment instructions
```

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd week-5-web-sockets-assignment-pat123456789g
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

### 4. Environment Setup
Create `.env` files in both server and client directories:

**Server (.env):**
```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client (.env):**
```env
VITE_SOCKET_URL=http://localhost:5000
```

### 5. Start Development Servers

**Terminal 1 - Start the backend server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start the frontend server:**
```bash
cd client
npm run dev
```

### 6. Access the Application
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

## 📡 API Documentation

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/users` | GET | Get all online users |
| `/api/rooms` | GET | Get all available rooms |
| `/api/messages/:roomId` | GET | Get messages for a room |
| `/api/private-messages/:conversationId` | GET | Get private conversation |
| `/api/unread/:userId` | GET | Get unread message count |
| `/api/upload` | POST | Upload file |
| `/api/search` | GET | Search messages |

## 🔌 Socket Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `user_join` | `{username, avatar}` | User joins the chat |
| `join_room` | `roomId` | Join a specific room |
| `send_message` | `{content}` | Send a message to current room |
| `send_private_message` | `{recipientId, content}` | Send private message |
| `typing_start` | - | Start typing indicator |
| `typing_stop` | - | Stop typing indicator |
| `add_reaction` | `{messageId, reaction}` | Add reaction to message |
| `send_file` | `{fileName, fileUrl, fileSize}` | Send file |
| `create_room` | `{name, description, isPrivate}` | Create new room |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `user_authenticated` | `userData` | User authentication successful |
| `users_update` | `userList` | Updated list of online users |
| `rooms_list` | `roomList` | Available rooms |
| `room_messages` | `messages` | Messages for joined room |
| `new_message` | `message` | New message received |
| `private_message` | `message` | Private message received |
| `user_typing` | `{userId, username, isTyping}` | Typing indicator |
| `reaction_update` | `{messageId, reactions}` | Message reaction update |

## 🎯 Advanced Features Implementation

### Real-time Notifications
- **Browser Notifications**: Uses Web Notifications API
- **In-app Toasts**: React Toastify integration
- **Sound Notifications**: Audio alerts for new messages
- **Unread Counters**: Visual indicators for unread messages

### File Upload System
- **Drag & Drop**: Intuitive file upload interface
- **File Type Validation**: Images and documents only
- **Size Limitations**: 5MB maximum file size
- **Preview Generation**: Image previews before upload
- **Secure Storage**: Files stored in server uploads directory

### Message System
- **Message Reactions**: Emoji reactions with user tracking
- **Read Receipts**: Track message read status
- **Message Search**: Full-text search across rooms
- **Pagination**: Efficient loading of message history
- **Timestamps**: Smart time formatting (Today, Yesterday, etc.)

### Connection Management
- **Auto-reconnection**: Automatic reconnection on disconnect
- **Connection Status**: Visual connection indicators
- **Heartbeat Monitoring**: Keep-alive messages
- **Graceful Degradation**: Fallback for connection issues

## 🚀 Performance Optimizations

### Client-side Optimizations
- **Component Memoization**: React.memo for expensive components
- **Virtual Scrolling**: Efficient rendering of large message lists
- **Image Lazy Loading**: On-demand image loading
- **Bundle Splitting**: Code splitting for faster initial loads
- **Caching**: Local storage for user preferences

### Server-side Optimizations
- **Message Limiting**: Prevent memory overflow with message limits
- **Room Management**: Efficient data structures for room handling
- **Connection Pooling**: Optimized socket connection management
- **Compression**: Gzip compression for responses
- **Rate Limiting**: Prevent spam and abuse

## 📝 Assignment Completion

This project successfully implements all the required features from the Week 5 assignment:

### ✅ Task 1: Project Setup
- [x] Node.js server with Express
- [x] Socket.io server configuration
- [x] React front-end application
- [x] Socket.io client setup
- [x] Basic connection between client and server

### ✅ Task 2: Core Chat Functionality
- [x] User authentication (username-based with avatars)
- [x] Global chat room functionality
- [x] Messages with sender name and timestamp
- [x] Typing indicators when users are composing
- [x] Online/offline status for users

### ✅ Task 3: Advanced Chat Features
- [x] Private messaging between users
- [x] Multiple chat rooms/channels
- [x] "User is typing" indicator
- [x] File and image sharing
- [x] Read receipts for messages
- [x] Message reactions (like, love, etc.)

### ✅ Task 4: Real-Time Notifications
- [x] Notifications for new messages
- [x] Join/leave room notifications
- [x] Unread message count display
- [x] Sound notifications for new messages
- [x] Browser notifications (Web Notifications API)

### ✅ Task 5: Performance and UX Optimization
- [x] Message pagination for loading older messages
- [x] Reconnection logic for handling disconnections
- [x] Socket.io optimization (using namespaces, rooms)
- [x] Message delivery acknowledgment
- [x] Message search functionality
- [x] Responsive design for desktop and mobile

### 🎉 Additional Features Beyond Requirements
- **Emoji Picker**: Enhanced user expression
- **Drag & Drop File Upload**: Improved file sharing UX
- **Room Creation**: Users can create custom rooms
- **Advanced Message Reactions**: Multiple reaction types
- **Connection Status Indicators**: Real-time connection monitoring
- **Modern UI/UX**: Clean, intuitive interface design

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) section
2. Read the documentation thoroughly
3. Test with different browsers
4. Check network connectivity
5. Create a new issue with detailed information

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for PLP MERN Stack Development - Week 5 Assignment**

*This project demonstrates modern web development practices and real-time communication implementation using Socket.io.* 