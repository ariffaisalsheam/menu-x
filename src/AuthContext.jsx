import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false); // New state to confirm initial auth check complete

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
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
    <AuthContext.Provider value={{ currentUser, loading, authReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
