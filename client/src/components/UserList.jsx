import React, { useState } from 'react';
import { FiUsers, FiMessageCircle } from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';

const UserList = ({ currentUser, onPrivateChat }) => {
  const { users } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter out current user and apply search
  const otherUsers = users
    .filter(user => user.id !== currentUser?.id && user.username !== currentUser?.username)
    .filter(user => 
      searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      default:
        return 'Offline';
    }
  };

  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-3">
          <FiUsers className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="font-semibold text-gray-900">
            Online ({otherUsers.length})
          </h3>
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {otherUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiUsers className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchTerm ? 'No users found' : 'No other users online'}
              </p>
            </div>
          ) : (
            otherUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center p-3 hover:bg-white rounded-lg transition-colors cursor-pointer group"
                onClick={() => onPrivateChat(user)}
              >
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  {/* Status Indicator */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}
                    title={getStatusText(user.status)}
                  ></div>
                </div>

                {/* User Info */}
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getStatusText(user.status)}
                  </p>
                </div>

                {/* Message Icon (show on hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiMessageCircle className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Click on a user to start a private chat
        </div>
      </div>
    </div>
  );
};

export default UserList;
