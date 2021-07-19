import React, { useState, useEffect } from "react";
import app from "../../firebase";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { BsInfoSquare } from "react-icons/bs";
import { RiDeleteBin7Line } from "react-icons/ri";
import { Modal } from "react-bootstrap";
import LoadingFullScreen from "../LoadingFullScreen";

export default function MyFavourites() {
  const [recipes, setRecipes] = useState([]);
  const { currentUser, setRecipeID } = useAuth();
  const userAPIRecipeRef = app.firestore().collection("userAPIRecipes").doc(currentUser.uid).collection("recipes");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recipeToDelete, setRecipeToDelete] = useState("");

  useEffect(() => {
    getSavedAPIRecipes();
  }, []);

  const getSavedAPIRecipes = () => {
    let tempArr = [];
    userAPIRecipeRef.get().then((queryAPISnapshot) => {
      queryAPISnapshot.forEach((doc) => {
        tempArr.push(doc.data());
      });
      setRecipes(tempArr);
      setIsLoading(false);
    });
  };

  const removeAPIRecipe = (id) => {
    userAPIRecipeRef
      .doc(id.toString())
      .delete()
      .then(() => {
        getSavedAPIRecipes();
        setShowDeleteModal(false);
      });
  };

  if (isLoading) {
    return <LoadingFullScreen />;
  } else if (!isLoading && recipes.length === 0) {
    return (
      <div className="container">
        <div className="alert alert-warning" role="alert">
          <h3>Your favourite recipes will appear here.</h3>
        </div>
      </div>
    );
  } else {
    return (
      <div className="container">
        <div className="card-columns">
          {recipes.map((recipe, index) => (
            <div className="card mb-3" key={index}>
              <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header>
                  <Modal.Title>Are you sure you want to delete this recipe?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <button className="btn btn-secondary btn-md" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-danger btn-md float-right" onClick={() => removeAPIRecipe(recipeToDelete)}>
                    Yes
                  </button>
                </Modal.Body>
              </Modal>
              <div className="recipeShare">
                <RiDeleteBin7Line
                  className="favouriteRecipeTitlePost"
                  type="button"
                  onClick={() => {
                    setRecipeToDelete(recipe.id);
                    setShowDeleteModal(true);
                  }}
                />
                <img className="card-img-top" src={recipe.image} />
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h3>{recipe.title}</h3>
                </div>
                <div className="row">
                  <div className="col">
                    <Link to="/more-info">
                      <button className="btn btn-success w-100" onClick={() => setRecipeID(recipe.id)}>
                        <div className="d-inline mr-1">
                          <BsInfoSquare size={20} />
                        </div>
                        <div className="d-inline">Info</div>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
