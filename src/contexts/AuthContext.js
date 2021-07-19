import React, { useContext, useState, useEffect } from "react";
import { auth, googleAuth } from "../firebase";
import app from "../firebase";
import LoadingFullScreen from "../components/LoadingFullScreen";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);

  const [recipeID, setID] = useState(0);

  function signUp(email, password) {
    return auth.createUserWithEmailAndPassword(email, password);
  }

  function signIn(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  function signOut() {
    return auth.signOut();
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
  }

  function updateEmail(email) {
    return currentUser.updateEmail(email);
  }

  function updatePassword(password) {
    return currentUser.updatePassword(password);
  }

  function sendEmailVerification() {
    return auth.currentUser.sendEmailVerification();
  }

  function signInWithGoogle() {
    return auth.signInWithPopup(googleAuth);
  }

  // so I can use recipeID anywhere in the app
  function setRecipeID(id) {
    setID(id);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateEmail,
    updatePassword,
    sendEmailVerification,
    signInWithGoogle,
    recipeID,
    setRecipeID,
    setIsLoading,
    setIsSignedUp,
  };

  if (isLoading) return <LoadingFullScreen />;

  if (isSignedUp)
    return (
      <div className="container">
        <div className="alert alert-success text-center" role="alert">
          Account created successfully. Signing in...
        </div>
        <div className="mfPlate">
          <div>
            <div className="spinnerHolder">
              <div className="spinner-border" role="status" aria-hidden="true"></div>
            </div>
            <h3>Loading...</h3>
          </div>
        </div>
      </div>
    );

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export default AuthProvider;
