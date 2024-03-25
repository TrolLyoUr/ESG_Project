import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import ESGPage from './ESGPage/ESGPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate replace to="/esg" />} />
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
