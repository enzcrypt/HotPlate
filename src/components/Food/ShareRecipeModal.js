import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { firebase } from "@firebase/app";
import app from "../../firebase";

export default function ShareRecipeModal(props) {
  const { currentUser } = useAuth();
  const [showIngredients, setShowIngredients] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showPostButton, setShowPostButton] = useState(true);
  const [postMessage, setPostMessage] = useState("");
  const feedCollection = app.firestore().collection("feed");
  const [userData, setUserData] = useState(null);
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

  const handlePostMessageChange = (event) => {
    setPostMessage(event.target.value);
  };

  const handlePostClick = (post, recipeID, image, title) => {
    recipeID = recipeID ? recipeID : null;
    image = image ? image : null;
    title = title ? title : null;
    const thisPostID = uuidv4();
    feedCollection
      .doc(thisPostID)
      .set({
        email: currentUser.email,
        post: post,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        recipeID: recipeID,
        image: image,
        recipeTitle: title,
        postID: thisPostID,
        childCommentSectionID: uuidv4(),
        authorFName: userData.firstName,
        authorSName: userData.lastName,
      })
      .then((docRef) => {
        if (docRef) {}
        else {
          const tempArr = [];
          feedCollection
            .doc(thisPostID)
            .get()
            .then((doc) => {
              tempArr.push(doc.data());
            })
            .catch((error) => {
              throw error;
            });
        }
        if (props.setRecipeSaved !== undefined) props.setRecipeSaved(true);
        if (props.setRecipeShared !== undefined) props.setRecipeShared(true);
        alert("Post successful.");
      })
      .catch((error) => {
        throw error;
      });
  };

  return (
    <div>
      {props.userCreatedRecipe.map((recipe) => (
        <Modal show={props.show} onHide={props.handleClose} key={recipe.id}>
          <Modal.Header closeButton>
            <Modal.Title>{recipe.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img className="card-img-top mb-3" src={recipe.image} />
            <div className="mb-3">{recipe.description}</div>
            <div className="mb-3">
              <button className="btn btn-warning w-100" onClick={() => setShowIngredients(!showIngredients)}>
                Ingredients
              </button>
              {!props.spoonacularRecipe && showIngredients && (
                <div className="mt-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </div>
              )}
              {props.spoonacularRecipe && showIngredients && (
                <div className="mt-3">
                  {recipe.extendedIngredients.map((ingredients, index) => (
                    <li key={index}>{ingredients.original}</li>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-3">
              <button className="btn btn-danger w-100" onClick={() => setShowInstructions(!showInstructions)}>
                Instructions
              </button>
              {!props.spoonacularRecipe && showInstructions && (
                <div className="mt-3">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </div>
              )}
              {props.spoonacularRecipe && showInstructions && (
                <div className="mt-3">
                  {recipe.analyzedInstructions.map((instruction, index) => (
                    <div key={index}>
                      {instruction.steps.map((step) => (
                        <div key={step.number}>
                          <li>{step.step}</li>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {showPostButton && (
              <div className="mb-3">
                <button className="btn btn-success w-100" onClick={() => setShowPostButton(false)}>
                  Post Description
                </button>
              </div>
            )}
            {!showPostButton && (
              <div>
                <div className="mb-3">
                  <input
                    className="form-control"
                    placeholder="Enter a post message"
                    onChange={handlePostMessageChange}
                  />
                </div>
              </div>
            )}
            <div>
              <button
                className="btn btn-primary w-100"
                onClick={() => {
                  handlePostClick(postMessage, recipe.id, recipe.image, recipe.title);
                  if (props.handleSaveClick) props.handleSaveClick();
                  props.handleClose();
                }}>
                Post
              </button>
            </div>
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      ))}
    </div>
  );
}
