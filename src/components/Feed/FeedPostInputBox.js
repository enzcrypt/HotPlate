import React, {useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { firebase } from "@firebase/app";
import app from "../../firebase";

export default function FeedPostInputBox(props) {
  const [postDetails, setPostDetails] = useState(0);
  const feedCollection = app.firestore().collection("feed");
  const [userData, setUserData] = useState(null);
  const {currentUser} = useAuth();
  var isMounted=false;

  useEffect(() => {
    isMounted=true;
    setPostDetails("");
    getUserData();
    return () => isMounted=false;
  }, []);
  
  function getUserData(){
    app.firestore().collection("Users").doc(currentUser.email).get().then((doc) => {
      if(isMounted) setUserData(doc.data());
    });
  }

  function handlePostContentChange(e){
    setPostDetails(e.target.value)
  }

  function handlePostClick(postDescription){
    const thisPostID = uuidv4();
    feedCollection
      .doc(thisPostID)
      .set({
        email: currentUser.email,
        post: postDescription,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        postID: thisPostID,
        childCommentSectionID: uuidv4(),
        authorFName: userData.firstName,
        authorSName: userData.lastName
      })
      .then((docRef) => {
        alert("Post successful.")
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  }

  return (
    <div className="card">
      <div className="card-body">
        <form onSubmit={(event) => {
            event.preventDefault();
            handlePostClick(postDetails);
            setPostDetails("");
          }}>
          <div className="mb-3">
            <input
              className="form-control"
              type="text"
              placeholder="Start a post"
              value={postDetails}
              onChange={handlePostContentChange}
              name="customPost"
            />
          </div>
          <div>
            <button className="btn btn-primary w-100" type="submit">
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
