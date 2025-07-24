import React, { useState, useRef } from 'react';
import { FiHash, FiPlus, FiLogOut, FiSettings } from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';
import CreateRoomModal from './CreateRoomModal';

const Sidebar = ({ user, onLogout }) => {
  const { rooms, currentRoom, joinRoom, unreadCount } = useSocket();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  
  const handleRoomSelect = (roomId) => {
    joinRoom(roomId);
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <h2 className="text-sm font-semibold">{user.username}</h2>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Chat Rooms
            </h3>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Create Room"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                  currentRoom === room.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FiHash className="w-4 h-4 mr-2" />
                <span className="flex-1 truncate">{room.name}</span>
                {room.userCount > 0 && (
                  <span className="text-xs bg-gray-600 px-1 py-0.5 rounded">
                    {room.userCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Socket.io Chat</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreate={(roomData) => {
            // Handle room creation
            setShowCreateRoom(false);
          }}
        />
      )}
    </div>
  );
};

export default Sidebar;
