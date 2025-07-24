import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { socket } from '../socket/socket';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children, user }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState(new Map());
  const [currentRoom, setCurrentRoom] = useState('general');
  const [rooms, setRooms] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Connect to socket
    socket.connect();
    socket.emit('user_join', { username: user.username, avatar: user.avatar });

    // Connection event handlers
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Connected to server');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    };

    const handleReconnect = () => {
      socket.emit('user_join', { username: user.username, avatar: user.avatar });
    };

    // User event handlers
    const handleUsersUpdate = (userList) => {
      setUsers(userList);
    };

    const handleUserAuthenticated = (userData) => {
      console.log('User authenticated:', userData);
    };

    // Room event handlers
    const handleRoomsList = (roomList) => {
      setRooms(roomList);
    };

    const handleRoomMessages = (roomMessages) => {
      setMessages(roomMessages);
    };

    const handleNewRoom = (room) => {
      setRooms(prev => [...prev, room]);
      toast.info(`New room created: ${room.name}`);
    };

    // Message event handlers
    const handleNewMessage = (message) => {
      if (message.roomId === currentRoom) {
        setMessages(prev => [...prev, message]);
      } else {
        // Show notification for messages in other rooms
        toast.info(`New message in ${rooms.find(r => r.id === message.roomId)?.name || 'Unknown Room'}`);
        setUnreadCount(prev => prev + 1);
      }

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        if (message.senderId !== socket.id) {
          new Notification(`${message.sender}`, {
            body: message.content || 'Sent a file',
            icon: message.senderAvatar
          });
        }
      }
    };

    const handlePrivateMessage = (message) => {
      const conversationId = message.conversationId;
      setPrivateMessages(prev => {
        const newMap = new Map(prev);
        const conversation = newMap.get(conversationId) || [];
        newMap.set(conversationId, [...conversation, message]);
        return newMap;
      });

      // Show notification for private messages
      if (message.senderId !== socket.id) {
        toast.info(`Private message from ${message.sender}`);
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Private message from ${message.sender}`, {
            body: message.content,
            icon: message.senderAvatar
          });
        }
      }
    };

    const handleMessageDelivered = ({ messageId }) => {
      console.log('Message delivered:', messageId);
    };

    // Typing event handlers
    const handleUserTyping = ({ userId, username, isTyping }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          return prev.includes(username) ? prev : [...prev, username];
        } else {
          return prev.filter(name => name !== username);
        }
      });
    };

    // Reaction event handlers
    const handleReactionUpdate = ({ messageId, reactions }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, reactions } : msg
      ));
    };

    // Join/leave event handlers
    const handleUserJoinedRoom = ({ user: joinedUser, roomId }) => {
      if (roomId === currentRoom) {
        toast.info(`${joinedUser.username} joined the room`);
      }
    };

    const handleUserLeftRoom = ({ user: leftUser, roomId }) => {
      if (roomId === currentRoom) {
        toast.info(`${leftUser.username} left the room`);
      }
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('users_update', handleUsersUpdate);
    socket.on('user_authenticated', handleUserAuthenticated);
    socket.on('rooms_list', handleRoomsList);
    socket.on('room_messages', handleRoomMessages);
    socket.on('new_room', handleNewRoom);
    socket.on('new_message', handleNewMessage);
    socket.on('private_message', handlePrivateMessage);
    socket.on('message_delivered', handleMessageDelivered);
    socket.on('user_typing', handleUserTyping);
    socket.on('reaction_update', handleReactionUpdate);
    socket.on('user_joined_room', handleUserJoinedRoom);
    socket.on('user_left_room', handleUserLeftRoom);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('users_update', handleUsersUpdate);
      socket.off('user_authenticated', handleUserAuthenticated);
      socket.off('rooms_list', handleRoomsList);
      socket.off('room_messages', handleRoomMessages);
      socket.off('new_room', handleNewRoom);
      socket.off('new_message', handleNewMessage);
      socket.off('private_message', handlePrivateMessage);
      socket.off('message_delivered', handleMessageDelivered);
      socket.off('user_typing', handleUserTyping);
      socket.off('reaction_update', handleReactionUpdate);
      socket.off('user_joined_room', handleUserJoinedRoom);
      socket.off('user_left_room', handleUserLeftRoom);
    };
  }, [user, currentRoom, rooms]);

  // Auto-join general room on connect
  useEffect(() => {
    if (isConnected && rooms.length > 0) {
      socket.emit('join_room', currentRoom);
    }
  }, [isConnected, rooms, currentRoom]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const sendMessage = (content) => {
    if (!content.trim()) return;
    socket.emit('send_message', { content });
  };

  const sendPrivateMessage = (recipientId, content) => {
    if (!content.trim()) return;
    socket.emit('send_private_message', { recipientId, content });
  };

  const joinRoom = (roomId) => {
    socket.emit('join_room', roomId);
    setCurrentRoom(roomId);
    setMessages([]);
    setUnreadCount(0);
  };

  const createRoom = (name, description, isPrivate = false) => {
    socket.emit('create_room', { name, description, isPrivate });
  };

  const startTyping = () => {
    socket.emit('typing_start');
  };

  const stopTyping = () => {
    socket.emit('typing_stop');
  };

  const addReaction = (messageId, reaction) => {
    socket.emit('add_reaction', { messageId, reaction });
  };

  const markMessageRead = (messageId) => {
    socket.emit('mark_message_read', messageId);
  };

  const sendFile = (fileData) => {
    socket.emit('send_file', fileData);
  };

  const value = {
    socket,
    isConnected,
    users,
    messages,
    privateMessages,
    currentRoom,
    rooms,
    typingUsers,
    unreadCount,
    sendMessage,
    sendPrivateMessage,
    joinRoom,
    createRoom,
    startTyping,
    stopTyping,
    addReaction,
    markMessageRead,
    sendFile
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
