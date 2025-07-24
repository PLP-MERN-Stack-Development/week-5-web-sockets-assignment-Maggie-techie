import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatRoom from '../components/ChatRoom';
import UserList from '../components/UserList';
import PrivateChat from '../components/PrivateChat';
import { useSocket } from '../context/SocketContext';

const ChatPage = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState('room'); // 'room', 'private'
  const [selectedPrivateChat, setSelectedPrivateChat] = useState(null);
  const { isConnected } = useSocket();

  const handlePrivateChat = (targetUser) => {
    setSelectedPrivateChat(targetUser);
    setActiveView('private');
  };

  const handleBackToRoom = () => {
    setActiveView('room');
    setSelectedPrivateChat(null);
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Connection Status */}
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Reconnecting to server...
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar user={user} onLogout={onLogout} />

      {/* Main Chat Area */}
      <div className="flex-1 flex">
        {activeView === 'room' ? (
          <ChatRoom user={user} />
        ) : (
          <PrivateChat 
            user={user} 
            targetUser={selectedPrivateChat} 
            onBack={handleBackToRoom}
          />
        )}
        
        {/* User List */}
        <UserList 
          currentUser={user} 
          onPrivateChat={handlePrivateChat}
        />
      </div>
    </div>
  );
};

export default ChatPage;
