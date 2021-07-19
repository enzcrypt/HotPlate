import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { Collapse, Button } from "react-bootstrap";
import ShareRecipeModal from "./ShareRecipeModal";
import ShareDMModal from "./ShareDMModal";
import app from "../../firebase";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import LoadingFullScreen from "../LoadingFullScreen";

export default function MoreInfo() {
  const userCreatedRecipesRef = app.firestore().collection("userCreatedRecipes");
  const [recipeInfoArray, setRecipeInfoArray] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nutritionChart, setNutritionChart] = useState({});
  const { recipeID, currentUser } = useAuth();
  const [showIngredients, setShowIngredients] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const recipeInfoURL = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipeID}/information?includeNutrition=false&rapidapi-key=${process.env.REACT_APP_API_KEY}`;
  const nutritionVisualisationURL = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipeID}/nutritionWidget?&defaultCss=true&rapidapi-key=${process.env.REACT_APP_API_KEY}`;
  const [show, setShow] = useState(false);
  const ref = app.firestore().collection("userAPIRecipes");
  const [delOrSave, setDelOrSave] = useState(false);
  const [spoonacularRecipe, setSpoonacularRecipe] = useState(null);
  const [currentUserIsAuthor, setCurrentUserIsAuthor] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const userRef = app.firestore().collection("Users");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDMModal, setShowDMModal] = useState(false);

  let mounted = true;

  useEffect(() => {
    getUserDetails();
    if (recipeID.toString().substring(0, 3) == "CR-") {
      setSpoonacularRecipe(false);
      // act here for custom recipe data
      getLocalRecipeInfo();
    } else {
      setSpoonacularRecipe(true);
      getRecipeInfo();
      getRecipeNutritionVisualised();
    }
    checkRecipeAdded(); // This should be possible for both custom recipes and spoonacular ones
    return () => {
      mounted = false;
    };
  }, []);

  function checkIfCurrentUserIsAuthor(tempArr) {
    if (!spoonacularRecipe && currentUser.uid == tempArr[0].authorUID) {
      setCurrentUserIsAuthor(true);
    }
  }

  const getUserDetails = () => {
    userRef
      .doc(currentUser.email)
      .get()
      .then((doc) => {
        setUserDetails(doc.data());
      })
      .catch((error) => {
        throw error;
      });
  };

  function getLocalRecipeInfo() {
    // copy pasta from MyRecipes I think
    userCreatedRecipesRef
      .doc(recipeID)
      .get()
      .then((response) => {
        let tempArr = [];
        tempArr.push(response.data());
        setIsLoading(false);
        setRecipeInfoArray(tempArr);
        checkIfCurrentUserIsAuthor(tempArr);
      })
      .catch((error) => {
        setErrorMsg(error);
      });
  }

  // get more information about a recipe from spoonacular
  const getRecipeInfo = () => {
    axios
      .get(recipeInfoURL)
      .then((response) => {
        let tempArr = [];
        if (mounted) {
          tempArr.push(response.data);
          setIsLoading(false);
          setRecipeInfoArray(tempArr);
        }
      })
      .catch((error) => {
        setErrorMsg(error);
      });
  };

  // get the visualised nutritional data for a recipe from spoonacualr
  const getRecipeNutritionVisualised = () => {
    axios
      .get(nutritionVisualisationURL)
      .then((response) => {
        if (mounted) {
          setIsLoading(false);
          setNutritionChart(response.data);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        setErrorMsg(error);
      });
  };

  //check if user has already added recipe to their saved recipes
  const checkRecipeAdded = () => {
    let apiref = ref.doc(currentUser.uid).collection("recipes");
    apiref
      .doc(recipeID.toString())
      .get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) setDelOrSave(true);
      });
  };
  //allow Signed-In users to save recipes to the database.
  //Duplicate handling already implemented in this method.
  const saveAPIRecipe = (id, title, image, ingred, instruct) => {
    ref.doc(currentUser.uid).set({
      uid: currentUser.uid,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
    });
    if (currentUser != null) {
      let apiref = ref.doc(currentUser.uid).collection("recipes");
      apiref
        .doc(id.toString())
        .get()
        .then((docSnapshot) => {
          if (docSnapshot.exists) alert("Recipe already saved!");
          else {
            apiref.doc(id.toString()).set({
              id: id,
              title: title,
              image: image,
              ingredients: ingred,
              instructions: instruct,
              fromAPI: true,
            });
            setDelOrSave(true);
            alert("Saved to Favourites");
          }
        });
    } else {
      alert("Please Sign-in to start saving recipes.");
    }
  };

  const handleCloseFilters = () => {
    setShowDeleteModal(false);
  };

  const removeAPIRecipe = (id) => {
    let apiref = ref.doc(currentUser.uid).collection("recipes");
    apiref.doc(id.toString()).delete();
    setDelOrSave(false);
    alert("Recipe removed");
  };

  const removeCustomRecipe = (id) => {
    userCreatedRecipesRef.doc(id).delete();
    setShowDeleteModal(false);
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleDMShowShare = () => setShowDMModal(!showDMModal);

  if (isLoading) {
    return <LoadingFullScreen />;
  }

  // if there is an error
  if (errorMsg) {
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">
          <h3>An error has occured. Recipe may no longer exist.</h3>
        </div>
      </div>
    );
  } else {
    // we have no errors and we have data

    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-6 col-sm-12">
            {recipeInfoArray.map((recipe) => (
              <div className="card mb-3" key={recipe?.id}>
                <div>
                  {recipe && (
                    <ShareRecipeModal
                      show={show}
                      userCreatedRecipe={recipeInfoArray}
                      handleClose={handleClose}
                      spoonacularRecipe={spoonacularRecipe}
                    />
                  )}
                  {recipe && (
                    <ShareDMModal
                      showDMModal={showDMModal}
                      recipeID={recipe.id}
                      handleDMShowShare={handleDMShowShare}
                    />
                  )}
                </div>
                <img className="card-img-top" src={recipe?.image ? recipe?.image : "noimage.jpg"} alt="recipe" />
                <div className="card-body">
                  <Modal show={showDeleteModal} onHide={handleCloseFilters}>
                    <Modal.Header>
                      <Modal.Title>Are you sure you want to delete this custom recipe?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <button className="btn btn-secondary btn-md" onClick={handleCloseFilters}>
                        Cancel
                      </button>
                      <Link to="/myrecipes2">
                        <button
                          className="btn btn-danger btn-md float-right"
                          onClick={() => removeCustomRecipe(recipe.id)}>
                          Yes
                        </button>
                      </Link>
                    </Modal.Body>
                  </Modal>

                  <h4>
                    <b>{recipe?.title ? recipe.title : "No Recipe Data Found! The recipe might have been deleted"} </b>
                  </h4>
                  {spoonacularRecipe && (
                    <p>
                      {" "}
                      Ready in: {" " + recipe.readyInMinutes + " "} minutes
                      <br />
                      Servings: {" " + recipe.servings}
                    </p>
                  )}
                  <button className="btn btn-primary" onClick={handleShow}>
                    Share
                  </button>
                  <button className="btn btn-secondary" onClick={handleDMShowShare}>
                    Share via DM
                  </button>
                  {delOrSave && !currentUserIsAuthor && (
                    <button className="btn btn-danger float-right" onClick={() => removeAPIRecipe(recipe.id)}>
                      Remove Recipe
                    </button>
                  )}
                  {!delOrSave && !currentUserIsAuthor && (
                    <button
                      className="btn btn-secondary float-right"
                      onClick={() =>
                        saveAPIRecipe(
                          recipe.id,
                          recipe.title,
                          recipe.image,
                          recipe.extendedIngredients || recipe.ingredients,
                          recipe.analyzedInstructions || recipe.instructions
                        )
                      }>
                      Save
                    </button>
                  )}
                  {currentUserIsAuthor && (
                    <button className="btn btn-danger float-right" onClick={() => setShowDeleteModal(true)}>
                      Delete Custom Recipe
                    </button>
                  )}

                  <hr />
                  <button className="btn btn-warning w-100" onClick={() => setShowIngredients(!showIngredients)}>
                    Ingredients
                  </button>
                  {spoonacularRecipe ? (
                    <Collapse in={showIngredients}>
                      <div className="mt-3">
                        {recipe.extendedIngredients.map((ingredients, index) => (
                          <li key={index}>{ingredients.original}</li>
                        ))}
                      </div>
                    </Collapse>
                  ) : (
                    recipe?.ingredients && (
                      <Collapse in={showIngredients}>
                        <div className="mt-3">
                          {recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                          ))}
                        </div>
                      </Collapse>
                    )
                  )}
                  <hr />
                  <button className="btn btn-success w-100" onClick={() => setShowInstructions(!showInstructions)}>
                    Instructions
                  </button>
                  {spoonacularRecipe ? (
                    <Collapse in={showInstructions}>
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
                    </Collapse>
                  ) : (
                    recipe?.instructions && (
                      <Collapse in={showInstructions}>
                        <div className="mt-3">
                          {recipe.instructions.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </div>
                      </Collapse>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
          {spoonacularRecipe && (
            <div className="col-lg-6 col-sm-12">
              <button
                className="btn btn-primary w-100 mb-2"
                data-toggle="collapse"
                data-target="#nutritionalInfo"
                aria-expanded="false"
                aria-controls="nutritionalInfo"
                onClick={() => setShowNutrition(!showNutrition)}>
                Nutritional Information
              </button>
              <Collapse in={showNutrition}>
                <div className="card mb-3">
                  <div
                    className="card-body"
                    id="nutritionalInfo"
                    dangerouslySetInnerHTML={{ __html: nutritionChart }}></div>
                </div>
              </Collapse>
            </div>
          )}
        </div>
      </div>
    );
  }
}
