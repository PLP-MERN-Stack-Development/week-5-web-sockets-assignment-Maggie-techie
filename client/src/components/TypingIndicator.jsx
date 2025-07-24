import React from 'react';

const TypingIndicator = ({ users }) => {
  if (users.length === 0) return null;

  const renderTypingText = () => {
    if (users.length === 1) {
      return `${users[0]} is typing`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing`;
    } else {
      return `${users.length} people are typing`;
    }
  };

  return (
    <div className="typing-indicator">
      <div className="flex space-x-1">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span className="text-sm text-gray-600 ml-2">
        {renderTypingText()}...
      </span>
    </div>
  );
};

export default TypingIndicator;
