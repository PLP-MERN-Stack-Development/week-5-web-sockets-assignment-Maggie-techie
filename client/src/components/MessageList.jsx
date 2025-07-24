import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { FiDownload, FiThumbsUp, FiHeart, FiSmile } from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';

const MessageList = ({ messages, currentUser }) => {
  const { addReaction } = useSocket();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReaction = (messageId, reaction) => {
    addReaction(messageId, reaction);
  };

  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  const renderFileMessage = (message) => {
    const isImage = message.fileName?.match(/\.(jpg|jpeg|png|gif)$/i);
    
    return (
      <div className="max-w-xs">
        {isImage ? (
          <div>
            <img
              src={message.fileUrl}
              alt={message.fileName}
              className="max-w-full rounded-lg cursor-pointer"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            <div className="mt-1 text-xs text-gray-500 flex items-center justify-between">
              <span>{message.fileName}</span>
              <button
                onClick={() => window.open(message.fileUrl, '_blank')}
                className="text-blue-500 hover:text-blue-700"
              >
                <FiDownload className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{message.fileName}</div>
                <div className="text-xs text-gray-500">
                  {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)} MB` : 'File'}
                </div>
              </div>
              <button
                onClick={() => window.open(message.fileUrl, '_blank')}
                className="text-blue-500 hover:text-blue-700 p-1"
              >
                <FiDownload className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReactions = (message) => {
    if (!message.reactions || Object.keys(message.reactions).length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(message.reactions).map(([reaction, users]) => (
          <button
            key={reaction}
            onClick={() => handleReaction(message.id, reaction)}
            className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 flex items-center gap-1"
            title={users.join(', ')}
          >
            <span>{reaction}</span>
            <span>{users.length}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div 
      ref={messagesContainerRef}
      className="h-full overflow-y-auto p-6 space-y-4"
    >
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
              {date}
            </div>
          </div>

          {/* Messages for this date */}
          {dateMessages.map((message, index) => {
            const isOwn = message.senderId === currentUser?.username || message.sender === currentUser?.username;
            const prevMessage = index > 0 ? dateMessages[index - 1] : null;
            const showAvatar = !prevMessage || prevMessage.sender !== message.sender;
            
            return (
              <div
                key={message.id}
                className={`flex items-end space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {showAvatar && !isOwn ? (
                    <img
                      src={message.senderAvatar || `https://ui-avatars.com/api/?name=${message.sender}&background=random`}
                      alt={message.sender}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-xs lg:max-w-md group ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Sender Name & Time */}
                  {showAvatar && (
                    <div className={`text-xs text-gray-500 mb-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      {!isOwn && <span className="font-medium">{message.sender}</span>}
                      <span className={`${!isOwn ? 'ml-2' : ''}`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.type === 'file' ? (
                      renderFileMessage(message)
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}
                  </div>

                  {/* Reactions */}
                  {renderReactions(message)}

                  {/* Quick Reactions (show on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 mt-1">
                    <button
                      onClick={() => handleReaction(message.id, '👍')}
                      className="text-xs p-1 hover:bg-gray-200 rounded"
                      title="Like"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleReaction(message.id, '❤️')}
                      className="text-xs p-1 hover:bg-gray-200 rounded"
                      title="Love"
                    >
                      ❤️
                    </button>
                    <button
                      onClick={() => handleReaction(message.id, '😊')}
                      className="text-xs p-1 hover:bg-gray-200 rounded"
                      title="Smile"
                    >
                      😊
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
