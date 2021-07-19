import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import app from "../../firebase";

function SignIn() {
  const [error, setError] = useState("");
  const { signIn, setIsLoading } = useAuth();
  const history = useHistory();
  // db ref
  const ref = app.firestore().collection("Users");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().min(8, "Password must be at least 8 characters").required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        setError("");
        // sign a user in with email and password
        await signIn(values.email, values.password);
        await ref.doc(values.email).update({ online: true });
        setIsLoading(true);
        history.push("/");
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setError("Incorrect email or password");
      }
    },
  });

  return (
    <div className="container d-flex justify-content-center" style={{ minHeight: "100%" }}>
      <div className="w-100" style={{ maxWidth: "450px" }}>
        <div className="card">
          <div className="card-body">
            <h3 className="card-title text-center mb-3">Sign In</h3>
            <form onSubmit={formik.handleSubmit}>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="email">Email</label>
                <input
                  className={`${formik.touched.email && formik.errors.email && "form-control is-invalid"} ${
                    formik.touched.email && !formik.errors.email ? "form-control is-valid" : "form-control"
                  }`}
                  type="email"
                  placeholder="Enter email"
                  id="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="invalid-feedback">{formik.errors.email}</div>
                ) : null}
              </div>
              <div className="mb-3">
                <label htmlFor="loginPassword">Password</label>
                <input
                  className={`${formik.touched.password && formik.errors.password && "form-control is-invalid"} ${
                    formik.touched.password && !formik.errors.password ? "form-control is-valid" : "form-control"
                  }`}
                  type="password"
                  placeholder="Enter password"
                  id="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className="invalid-feedback">{formik.errors.password}</div>
                ) : null}
              </div>
              <div className="mb-3">
                <button type="submit" className="btn btn-success w-100">
                  Sign in
                </button>
              </div>
            </form>
            <div className="w-100 text-center">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            <div className="w-100 text-center">
              <p>
                Don't have an account? <Link to="/sign-up">Sign up</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
