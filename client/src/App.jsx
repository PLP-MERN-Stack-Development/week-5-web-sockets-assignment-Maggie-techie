import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import { SocketProvider } from './context/SocketContext';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('chatUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('chatUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chatUser');
  };

  return (
    <Router>
      <div className="App">
        <SocketProvider user={user}>
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/chat" />} 
            />
            <Route 
              path="/chat" 
              element={user ? <ChatPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />
            <Route path="/" element={<Navigate to={user ? "/chat" : "/login"} />} />
          </Routes>
        </SocketProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
