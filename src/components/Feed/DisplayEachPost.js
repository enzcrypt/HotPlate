import React, { useState, useEffect } from "react";
import { FaRegCommentDots } from "react-icons/fa";
import { AiOutlineLike } from "react-icons/ai";
import { firebase } from "@firebase/app";
import { useAuth } from "../../contexts/AuthContext";
import RecipeCard from "./RecipeCard";
import CommentsSection from "./CommentsSection";
import app from "../../firebase";
import { Modal } from "react-bootstrap";

export default function DisplayEachPost(props) {
  const { currentUser } = useAuth();
  const [showCommentSection, setShowCommentSection] = useState(false);
  const userDBRef = app.firestore().collection("Users");
  const [numLikes, setNumLikes] = useState(0);
  const [numComments, setNumComments] = useState(0);

  const [currentUserData, setCurrentUserData] = useState([]);

  const [likeOrUnlike, setLikeOrUnlike] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postByCurrentUser, setPostByCurrentUser] = useState(false);

  const likeRef = app.firestore().collection("feed").doc(props.postID).collection("Likes");
  const commentSectionRef = app
    .firestore()
    .collection("feed")
    .doc(props.postID)
    .collection(props.childCommentSectionID);

  const checkNumLikes = () => {
    return likeRef.onSnapshot((snapShot) => {
      setNumLikes(snapShot.size);
    });
  };

  const checkNumComments = () => {
    return commentSectionRef.onSnapshot((snapshot) => {
      setNumComments(snapshot.size);
    });
  };

  const deletePost = (id) => {
    let userPost = app.firestore().collection("feed").doc(id);
    userPost.delete();
  };

  //enables user to delete their comment, deletes by timestamp (arg passed in), deletes entire doc
  //and updates comments
  const handleDeleteCommentClick = (time) => {
    commentSectionRef
      .where("timestamp", "==", time)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.delete();
        });
      });
  };

  const checkPostByCurrentUser = () => {
    if (currentUser.email === props.email) {
      setPostByCurrentUser(true);
    }
  };

  const revealCommentSection = () => {
    setShowCommentSection(!showCommentSection);
  };

  const likedPost = () => {
    likeRef
      .doc(currentUser.email)
      .get()
      .then((docSnapshot) => {
        if (!docSnapshot.exists) {
          likeRef.doc(currentUser.email).set({
            email: currentUser.email,
            uid: currentUser.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          });
          setLikeOrUnlike(true);
          checkNumLikes();
        } else {
          likeRef.doc(currentUser.email).delete();
          setLikeOrUnlike(false);
          checkNumLikes();
        }
      });
  };

  const handleCloseFilters = () => {
    setShowDeleteModal(false);
  };

  useEffect(() => {
    let isMounted = true;
    // Get User Data
    userDBRef
      .doc(props.email)
      .get()
      .then((doc) => {
        if (isMounted) setCurrentUserData(doc.data());
      })
      .catch((error) => {
        throw error;
      });
    const unsub1 = checkNumLikes();
    const unsub2 = checkNumComments();
    // Check if post is liked by current user
    likeRef
      .doc(currentUser.email)
      .get()
      .then((docSnapshot) => {
        if (isMounted && docSnapshot.exists) setLikeOrUnlike(true);
      });
    checkPostByCurrentUser();
    return () => {
      unsub1();
      unsub2();
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <div className="card mb-3" key={props.postID}>
        <div className="card-body">
          {postByCurrentUser && (
            <button className="btn btn-light btn-sm float-right" onClick={() => setShowDeleteModal(true)}>
              X
            </button>
          )}
          <div>
            <Modal show={showDeleteModal} onHide={handleCloseFilters}>
              <Modal.Header>
                <Modal.Title>Are you sure you want to delete this post?</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <button className="btn btn-secondary btn-md" onClick={handleCloseFilters}>
                  Cancel
                </button>
                <button className="btn btn-danger btn-md float-right" onClick={() => deletePost(props.postID)}>
                  Delete Post
                </button>
              </Modal.Body>
            </Modal>
          </div>
          <div className="row mb-2">
            <div className="d-inline-block">
              <img src={currentUserData?.avatar} className="rounded-circle ml-3 mr-3 mb-1" height="60" width="60" />
            </div>
            <div className="d-inline-block">
              <b>
                {props.authorFName && props.authorFName.length > 0
                  ? props.authorFName + " "
                  : currentUserData?.firstName + " "}
                {props.authorSName && props.authorSName.length > 0
                  ? props.authorSName + " "
                  : currentUserData?.lastName + " "}
              </b>
              <br />
              <small>{props.timestamp?.toDate().toLocaleString()}</small>
            </div>
          </div>

          {props.post?.length > 0 && <p>{props.post}</p>}
          {props.image && (
            <RecipeCard
              recipeImage={props.image}
              recipeTitle={props.recipeTitle}
              recipeID={props.recipeID}
            />
          )}
          <div className="d-inline">
            <button className="btn btn-like btn-sm w-50 d-inline" onClick={() => likedPost()}>
              <div className="d-inline mr-1">
                {numLikes}
                <AiOutlineLike />
              </div>
              {!likeOrUnlike && <div className="d-inline">Like</div>}
              {likeOrUnlike && <div className="d-inline">Unlike</div>}
            </button>
          </div>
          <div className="d-inline">
            {showCommentSection ? (
              <button className="btn btn-secondary btn-sm w-50 d-inline" onClick={revealCommentSection}>
                <div className="d-inline mr-1">
                  <FaRegCommentDots />
                </div>
                <div className="d-inline">Hide Comments</div>
              </button>
            ) : (
              <button className="btn btn-comment btn-sm w-50 d-inline" onClick={revealCommentSection}>
                <div className="d-inline mr-1">
                  <FaRegCommentDots />
                </div>
                <div className="d-inline">Show Comments {numComments > 0 && "(" + numComments + ")"}</div>
              </button>
            )}
          </div>
          {showCommentSection && (
            <CommentsSection
              postID={props.postID}
              commentSectionID={props.childCommentSectionID}
              handleDeleteCommentClick={handleDeleteCommentClick}
              currentUserData={currentUserData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
