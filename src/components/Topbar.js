import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ actionLabel, actionPath, isDarkMode, onToggleDarkMode }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo">D2F</div>
        </div>
        <div className="topbar-right">
          <button
            className={`darkmode-toggle-btn ${isDarkMode ? 'is-dark' : ''}`}
            onClick={onToggleDarkMode}
            aria-label="Toggle theme"
          >
            <span className="toggle-icon" aria-hidden="true">{isDarkMode ? '🌙' : '☀️'}</span>
            <span className="toggle-label">{isDarkMode ? 'Dark' : 'Light'}</span>
          </button>
          <button className="new-invoice-btn" onClick={() => navigate(actionPath)}>{actionLabel}</button>
          <button className="logout-topbar-btn" onClick={handleLogout}>Logout</button>
          <div className="avatar">
            <img src="/profile.png" alt="Profile" />
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={cancelLogout}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Logout?</h3>
            <p>You will be signed out of Docs as Forms.</p>
            <div className="confirm-actions">
              <button className="secondary" type="button" onClick={cancelLogout}>Cancel</button>
              <button className="danger" type="button" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
