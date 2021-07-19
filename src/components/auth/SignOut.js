import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import app from "../../firebase";

export default function SignOut() {
  const { currentUser, signOut, setIsLoading } = useAuth();
  const history = useHistory();

  //database ref
  const ref = app.firestore().collection("Users");

  // sign out user
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await ref.doc(currentUser.email).update({ online: false });
      await signOut();
      history.push("/");
      setIsLoading(false);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div>
      <button className="btn btn-danger w-100" onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  );
}
