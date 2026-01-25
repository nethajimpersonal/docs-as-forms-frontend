import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import FormCreator from './components/FormCreator';
import FormList from './components/FormList';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      {isLoginPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><FormList /></ProtectedRoute>} />
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
                      <FormCreator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/list"
                  element={
                    <ProtectedRoute>
                      <FormList />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<ProtectedRoute><FormList /></ProtectedRoute>} />
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
