import React, { useState } from 'react';
import { FiUser, FiMessageCircle } from 'react-icons/fi';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    
    // Simulate a brief loading period
    setTimeout(() => {
      onLogin({
        username: username.trim(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username.trim())}&background=random&color=fff`
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-4">
            <FiMessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Chat App</h1>
          <p className="text-gray-600">Connect with people around the world in real-time</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Choose your username
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
                maxLength={20}
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This will be your display name in the chat
            </p>
          </div>

          <button
            type="submit"
            disabled={!username.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Joining Chat...
              </div>
            ) : (
              'Join Chat'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="text-sm text-gray-500 space-y-1">
            <p>✨ Real-time messaging</p>
            <p>🎯 Multiple chat rooms</p>
            <p>💬 Private messaging</p>
            <p>📁 File sharing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
