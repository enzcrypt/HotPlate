import React, { useEffect, useState } from "react";
import { firebase } from "@firebase/app";
import app from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function CommentBox(props) {
  const postID = props.postID;
  const { currentUser } = useAuth();
  const [comment, setComment] = useState("");
  const [userData, setUserData] = useState(null);
  const feedCollection = app.firestore().collection("feed");
  var isMounted = false;

  useEffect(() => {
    isMounted = true;
    getUserData();
    return () => (isMounted = false);
  }, []);

  function getUserData() {
    app
      .firestore()
      .collection("Users")
      .doc(currentUser.email)
      .get()
      .then((doc) => {
        if (isMounted) setUserData(doc.data());
      });
  }

  const handlePostComment = (comment, postID, childCommentSectionID) => {
    if (comment.length > 0 && postID) {
      feedCollection
        .where("postID", "==", postID)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            if (doc.exists) {
              doc.ref
                .collection(childCommentSectionID)
                .add({
                  comment: comment,
                  commentSectionID: childCommentSectionID,
                  from: currentUser.email,
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                })
                .catch((error) => {
                  throw error;
                });
            }
          });
        });
    }
  };

  const handleCommentBoxChange = (e) => {
    setComment(e.target.value);
  };

  useEffect(() => {
    props.scrollToBottomElement();
  }, []);

  return (
    <div className="commentBox">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handlePostComment(comment, postID, props.commentSectionID);
          setComment("");
          props.setShowCommentBox(false);
        }}>
        <input type="text" placeholder="Enter comment" value={comment} onChange={handleCommentBoxChange} />
        <button type="submit" className="comment-btn btn-primary btn-sm">
          Post
        </button>
        <button
          className="comment-btn btn-secondary btn-sm"
          onClick={() => {
            setComment("");
            props.setShowCommentBox(false);
          }}>
          Cancel
        </button>
      </form>
    </div>
  );
}
