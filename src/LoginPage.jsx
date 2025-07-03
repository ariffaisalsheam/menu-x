import React, { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebaseConfig';
import styles from './LoginPage.module.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully with email and password!');
      alert('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in with email and password:', error.message);
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log('User logged in successfully with Google!');
      alert('Google login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
      alert(`Google login failed: ${error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1>Owner Login</h1>
        <form onSubmit={handleEmailLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
        <button onClick={handleGoogleLogin} className={styles.googleLoginButton}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
