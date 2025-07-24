import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import FileUpload from './FileUpload';
import EmojiPicker from './EmojiPicker';

const ChatRoom = ({ user }) => {
  const { 
    currentRoom, 
    rooms, 
    messages, 
    sendMessage, 
    startTyping, 
    stopTyping,
    typingUsers,
    sendFile
  } = useSocket();
  
  const [messageInput, setMessageInput] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentRoomData = rooms.find(room => room.id === currentRoom);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentRoom]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessageInput(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      startTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping();
      }
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessage(messageInput);
    setMessageInput('');
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      stopTyping();
    }
    
    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (fileData) => {
    sendFile(fileData);
    setShowFileUpload(false);
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    // Stop typing when input loses focus
    setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping();
      }
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Room Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              # {currentRoomData?.name || 'Loading...'}
            </h1>
            <p className="text-sm text-gray-500">
              {currentRoomData?.description || 'No description available'}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {currentRoomData?.userCount || 0} members
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} currentUser={user} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-2">
          <TypingIndicator users={typingUsers} />
        </div>
      )}

      {/* Message Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-2">
            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => setShowFileUpload(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Attach file"
            >
              <FiPaperclip className="w-5 h-5" />
            </button>

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                placeholder={`Message # ${currentRoomData?.name || 'room'}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows="1"
                style={{
                  minHeight: '40px',
                  maxHeight: '120px',
                  height: 'auto'
                }}
              />
              
              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Add emoji"
              >
                <FiSmile className="w-5 h-5" />
              </button>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Send message"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          onClose={() => setShowFileUpload(false)}
          onUpload={handleFileUpload}
        />
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-6 z-10">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
