import React, { useState } from "react";
import { Navbar } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import app from "../../firebase";

export default function SignedOutNavBar() {
  const [error, setError] = useState("");
  const { signIn, setIsLoading } = useAuth();
  const history = useHistory();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  // db ref
  const ref = app.firestore().collection("Users");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await signIn(email, password);
      await ref.doc(email).update({ online: true });
      setIsLoading(true);
      history.push("/");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError("incorrect email or password");
    }
  };

  return (
    <Navbar collapseOnSelect expand="lg" bg="light" fixed="top">
      <Navbar.Brand>
        <img src="hotPlate_Logo_Full_gradient_fullcol_240x90.svg" width="150" alt="logo" />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse className="justify-content-end" id="responsive-navbar-nav">
        <form onSubmit={handleSignInSubmit}>
          <div className="d-flex">
            {error && (
              <div className="alert alert-danger p-1 m-auto" role="alert">
                {error}
              </div>
            )}
            <div className="mr-2 ml-2">
              <input className="form-control mr-sm-2" placeholder="Enter email" onChange={handleEmailChange} />
            </div>
            <div className="mr-2">
              <input
                type="password"
                className="form-control mr-sm-2"
                placeholder="Enter password"
                onChange={handlePasswordChange}
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary">
                Sign in
              </button>
            </div>
          </div>
        </form>
      </Navbar.Collapse>
    </Navbar>
  );
}
