import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import ResetPassword from './resetPassword';
import ESGPage from './ESGPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/esg" element={<ESGPage />} />
        <Route 
          path="/dashboard" 
          element={
            
            localStorage.getItem('user') ? <Dashboard /> : <Navigate replace to="/login" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
