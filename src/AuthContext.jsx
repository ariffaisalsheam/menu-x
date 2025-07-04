import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // New state for user profile from backend
  const [isAdmin, setIsAdmin] = useState(false); // New state for admin status
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false); // New state to confirm initial auth check complete

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('http://localhost:8089/api/users/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            // You might send additional user info here if needed for initial profile creation
            // body: JSON.stringify({ uid: user.uid, email: user.email, displayName: user.displayName })
          });

          if (response.ok) {
            const profile = await response.json();
            setUserProfile(profile);
            setIsAdmin(profile.role === 'ADMIN');
          } else {
            console.error('Failed to fetch user profile from backend:', response.statusText);
            setUserProfile(null);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error fetching user profile or ID token:', error);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false); // Authentication check is complete
      setAuthReady(true); // Initial auth state has been determined
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Display a loading indicator until the initial authentication state is determined
  if (!authReady) {
    return <div>Initializing authentication...</div>; // Or a full-page loading spinner
  }

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, isAdmin, loading, authReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
