import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FormCreator from './components/FormCreator';
import FormList from './components/FormList';
import './App.css';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="container">
        <nav className="nav-links">
          <Link to="/create">Create Form</Link>
          <Link to="/list">Form List</Link>
        </nav>
        <Routes>
          <Route path="/create" element={<FormCreator />} />
          <Route path="/list" element={<FormList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
