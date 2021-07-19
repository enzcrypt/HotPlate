import React, { useState, useEffect } from "react";
import FeedPostInputBox from "./FeedPostInputBox";
import app from "../../firebase";
import DisplayEachPost from "./DisplayEachPost";
import LoadingFullScreen from "../LoadingFullScreen";

export default function Feed() {
  const [postArray, setPostArray] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  //database ref
  const ref = app.firestore().collection("feed");

  useEffect(() => {
    const unsub = getData();
    return () => unsub();
  }, []);

  function getData() {
    return ref.orderBy("timestamp", "desc").onSnapshot((snapshot) => {
      if(!snapshot.metadata.hasPendingWrites)setPostArray(snapshot.docs.map((doc) => doc.data()));
      setIsLoading(false);
    });
  }

  if (isLoading) {
    return (
      <LoadingFullScreen />
    );
  }

  return (
    <div className="container d-flex justify-content-center" style={{ minHeight: "100%" }}>
      <div className="w-100" style={{ maxWidth: "450px" }}>
        <div>
          <FeedPostInputBox />
          <br />
          {postArray.map((post) => (
            <DisplayEachPost
              key={post.postID}
              post={post.post}
              email={post.email}
              timestamp={post.timestamp}
              image={post.image}
              recipeTitle={post.recipeTitle}
              recipeID={post.recipeID}
              postID={post.postID}
              childCommentSectionID={post.childCommentSectionID}
              authorFName={post.authorFName}
              authorSName={post.authorSName}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
