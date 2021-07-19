import React, { useState, useEffect } from "react";
import SignOut from "../auth/SignOut";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import app from "../../firebase";
import { Modal } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import LoadingFullScreen from "../LoadingFullScreen";
import { v4 as uuidv4 } from "uuid";

export default function Profile() {
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const [userDetails, setUserDetails] = useState([]);
  const [fileURL, setFileURL] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  // db ref
  const ref = app.firestore().collection("Users");

  useEffect(() => {
    getUserDetails();
  }, []);

  // get the current users details from firestore
  const getUserDetails = () => {
    setIsLoading(true);
    ref
      .doc(currentUser.email)
      .get()
      .then((doc) => {
        let tempArr = [];
        tempArr.push(doc.data());
        setUserDetails(tempArr);
        setIsLoading(false);
      })
      .catch((error) => {
        setError("Error retrieving user details");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await ref.doc(currentUser.email).update({ avatar: fileURL });
    getUserDetails();
    setFileName("");
  };

  const removeProfilePicture = async () => {
    await ref.doc(currentUser.email).update({ avatar: null });
    getUserDetails();
    setShowDeleteModal(false);
  };

  // handles the users uploaded image
  // when the user clicks "upload" update that users avatar image
  // We have a problem here with unique filenames. This is as per docs but is not working.
  // An imperfect fix was implemented, and removed.
  // A seemingly better fix, from firebase docs, was implemented, and it does not seem to be working.
  // See: https://firebase.google.com/docs/storage/web/upload-files
  // FILES NEED UNIQUE REF
  // OTHERWISE WE END UP WITH LOADS OF 403 ERRORS ON OUR PROFILE IMAGES
  // This is now happening again, despite the below fix with duplicate images / images with the same name (noticed when I set multiple profiles to have the same profile photo)
  const handleFileChange = async (e) => {
    setFileName("");
    const file = e.target.files[0];
    const fileNameArray = file?.name.split(".");
    if (fileNameArray.length == 0 || !fileNameArray)
      return setErrorMsg("Bad file: please ensure it is a .jpg or .png file");
    if (!["jpg", "jpeg", "png"].includes(fileNameArray[fileNameArray.length - 1].toLowerCase()))
      return setErrorMsg("Only png and jpg files are supported."); // check file type
    setFileName(file.name);
    const uniqueFileName = uuidv4().toString() + "." + fileNameArray[fileNameArray.length - 1];
    setErrorMsg("");
    const storageRef = app.storage().ref(); //firebase storage ref
    const fileRef = storageRef.child(uniqueFileName);
    await fileRef.put(file); // put file in storage
    setFileURL(await fileRef.getDownloadURL());
  };

  if (isLoading) {
    return <LoadingFullScreen />;
  }

  return (
    <div className="container d-flex justify-content-center" style={{ minHeight: "100%" }}>
      <div className="w-100" style={{ maxWidth: "450px" }}>
        <div>
          {userDetails.map((user) => (
            <div className="card mb-3" key={user.email}>
              <div className="card-body">
                <h3 className="card-title text-center mb-3">Profile</h3>
                <div className="d-flex justify-content-center mb-3">
                  {user.avatar === null ? (
                    <img className="rounded-circle" src="defaultuser.png" width="150" height="150" />
                  ) : (
                    <div style={{ position: "relative" }}>
                      <img className="rounded-circle" src={user.avatar} width="150" height="150" />
                      <div
                        style={{ position: "absolute", top: "0", right: "0", cursor: "pointer" }}
                        onClick={() => setShowDeleteModal(true)}>
                        <BsTrash />
                      </div>
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <form onSubmit={handleSubmit}>
                    <div className="custom-file mb-3">
                      <input
                        type="file"
                        className="custom-file-input"
                        id="image"
                        name="image"
                        onChange={handleFileChange}
                      />

                      {fileName ? (
                        <label className="custom-file-label" htmlFor="file-upload">
                          {fileName}
                        </label>
                      ) : (
                        <label className="custom-file-label" htmlFor="file-upload">
                          Choose profile image...
                        </label>
                      )}
                    </div>
                    {errorMsg && (
                      <div className="alert alert-danger" role="alert">
                        {errorMsg}
                      </div>
                    )}
                    <div>
                      <button type="submit" className="btn btn-warning w-100" disabled={!fileName}>
                        Upload
                      </button>
                    </div>
                  </form>
                </div>

                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                  <Modal.Header>
                    <Modal.Title>Are you sure you want to delete your profile picture?</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <button className="btn btn-secondary btn-md" onClick={() => setShowDeleteModal(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-danger btn-md float-right" onClick={removeProfilePicture}>
                      Yes
                    </button>
                  </Modal.Body>
                </Modal>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <div key={user.email}>
                  <div className="mb-1">
                    <strong>First name:</strong> {user.firstName}
                  </div>
                  <div className="mb-1">
                    <strong>Last name:</strong> {user.lastName}
                  </div>
                  <div className="mb-1">
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div className="mb-3">
                    <strong>Joined:</strong> {user.joined}
                  </div>
                </div>
                <div className="mb-3">
                  <SignOut />
                </div>
                <div>
                  <Link to="/update-profile">
                    <button className="btn btn-info w-100">Update profile</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
