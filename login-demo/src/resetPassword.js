import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './resetPassword.css'; 

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const navigate = useNavigate();

  const handlePasswordReset = (e) => {
    e.preventDefault();
    // Check if passwords match
    if (newPassword !== confirmNewPassword) {
      alert("Passwords don't match.");
      return;
    }

    // Retrieve the stored user data
    const storedUser = JSON.parse(localStorage.getItem('user'));
    // Check if the email entered matches the stored email
    if (storedUser && storedUser.email === email) {
      // Update the password and save it back to local storage
      storedUser.password = newPassword;
      localStorage.setItem('user', JSON.stringify(storedUser));
      alert('Password has been reset successfully.');
      navigate('/login'); // Navigate to login after reset
    } else {
      alert('The provided email does not match our records.');
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={handlePasswordReset}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
        <button type="submit" className="confirm-btn">Confirm</button>
      </form>
    </div>
  );
};

export default ResetPassword;
