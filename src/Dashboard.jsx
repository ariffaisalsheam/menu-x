import React from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { useAuth } from './AuthContext';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth(); // Destructure isAdmin

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully!');
      // The ProtectedRoute will handle redirection to /login
    } catch (error) {
      console.error('Error signing out:', error.message);
      alert(`Logout failed: ${error.message}`);
    }
  };

  const displayName = currentUser?.displayName || currentUser?.email || 'User';

  return (
    <div className={styles.container}>
      <h1 className={styles.welcomeMessage}>Welcome back, {displayName}!</h1>

      <div className={styles.cardsContainer}>
        <div className={styles.card}>
          <h2>Today's Menu Views</h2>
          <p className={styles.metric}>142</p>
        </div>
        <div className={styles.card}>
          <h2>Total Menu Items</h2>
          <p className={styles.metric}>18</p>
        </div>
      </div>

      <Link to="/menu-management" className={styles.manageMenuButton}>
        Manage My Menu
      </Link>

      {isAdmin && ( // Conditionally render Super Admin link
        <Link to="/super-admin-dashboard" className={styles.manageMenuButton} style={{ marginTop: '10px' }}>
          Super Admin Dashboard
        </Link>
      )}

      <button onClick={handleLogout} className={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
