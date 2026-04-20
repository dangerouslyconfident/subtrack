import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase';

// 1. Create the Context (This is our global state container for Auth)
const AuthContext = createContext();

// 2. Create the Provider Component to wrap our app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Registers a new user with Firebase using Email and Password.
   */
  function register(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  /**
   * Logs in an existing user.
   */
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  /**
   * Logs out the current user.
   */
  function logout() {
    return signOut(auth);
  }

  /**
   * useEffect to subscribe to the auth state exactly once when the component mounts.
   * This is how we remember the user is logged in even after refreshing the page!
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // We have finished checking the initial auth state
    });

    // Cleanup the event listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // What we expose to the rest of the application
  const value = {
    user,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Do not render the children until initial loading is complete to prevent layout shift */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Custom Hook to easily access Auth context from any component
export function useAuth() {
  return useContext(AuthContext);
}
