import React, { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiSend, FiMoreHorizontal } from 'react-icons/fi';
import { format } from 'date-fns';
import { useSocket } from '../context/SocketContext';

const PrivateChat = ({ user, targetUser, onBack }) => {
  const { socket, sendPrivateMessage, privateMessages } = useSocket();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Generate conversation ID (consistent order)
  const conversationId = [user.username, targetUser.username].sort().join('_');
  const conversation = privateMessages.get(conversationId) || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendPrivateMessage(targetUser.id, message);
    setMessage('');
  };

  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          
          <img
            src={targetUser.avatar || `https://ui-avatars.com/api/?name=${targetUser.username}&background=random`}
            alt={targetUser.username}
            className="w-10 h-10 rounded-full mr-3"
          />
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {targetUser.username}
            </h1>
            <p className="text-sm text-gray-500">
              {targetUser.status === 'online' ? 'Active now' : 'Last seen recently'}
            </p>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiMoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {conversation.length === 0 ? (
          <div className="text-center py-8">
            <img
              src={targetUser.avatar || `https://ui-avatars.com/api/?name=${targetUser.username}&background=random`}
              alt={targetUser.username}
              className="w-20 h-20 rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start a conversation with {targetUser.username}
            </h3>
            <p className="text-gray-500 text-sm">
              Send a message to start chatting
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversation.map((msg) => {
              const isOwn = msg.senderId === socket.id || msg.sender === user.username;
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message ${targetUser.username}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows="1"
              style={{
                minHeight: '40px',
                maxHeight: '120px',
                height: 'auto'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrivateChat;
