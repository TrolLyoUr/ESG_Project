import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.email === email && storedUser.password === password) {
            navigate('/dashboard');
    } else {
      alert('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src="OIP.jpg" alt="ESG Logo" />
      </div>
      <div className="login-form">
        <h2>Welcome Back!</h2>
        <p>Login to continue</p>
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email Address" 
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
          />
          <div className="login-remember">
            <label htmlFor="rememberMe">Remember Me</label>
            <input 
              id="rememberMe" 
              type="checkbox" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)} 
            />
            
          </div>
          <a href="/reset-password">Forgot password?</a>
          <button type="submit" className="login-btn">Sign In</button>
        </form>
        <button type="button" className="register-btn" onClick={() => navigate('/register')}>New User? Sign Up</button>
      </div>
      <div className="login-footer">
        <p>Copyright Reserved ©2024 </p>
        <p>Terms and Conditions/Privacy Policy</p>
      </div>
    </div>
  );
};

export default Login;
