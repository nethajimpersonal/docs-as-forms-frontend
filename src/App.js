import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import CreatePage from './pages/CreatePage';
import ListPage from './pages/ListPage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      {isLoginPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><ListPage /></ProtectedRoute>} />
        </Routes>
      ) : (
        <div className="app-layout">
          <main className="main-content">
            <div className="container">
              <Routes>
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute>
                      <CreatePage isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/list"
                  element={
                    <ProtectedRoute>
                      <ListPage isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<ProtectedRoute><ListPage isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} /></ProtectedRoute>} />
              </Routes>
            </div>
          </main>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
