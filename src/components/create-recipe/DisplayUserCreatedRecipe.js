import React, { useState } from "react";
import { AiOutlineShareAlt } from "react-icons/ai";
import { BiSave } from "react-icons/bi";
import ShareRecipeModal from "../Food/ShareRecipeModal";

export default function DisplayUserCreatedRecipe(props) {
  const [showIngredients, setShowIngredients] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [show, setShow] = useState(false);
  const [recipeSaved, setRecipeSaved] = useState(false);
  const [recipeShared, setRecipeShared] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div className="card-deck">
      {props.userCreatedRecipe.map((recipe, index) => (
        <div className="card mb-3" key={index}>
          <img className="card-img-top mb-3" src={recipe.image} />
          <div className="card-body">
            <div className="mb-2">
              <h3>{recipe.title}</h3>
            </div>
            <div className="mb-3">{recipe.description}</div>
            <div className="mb-3">
              <button className="btn btn-warning w-100" onClick={() => setShowIngredients(!showIngredients)}>
                Ingredients
              </button>
              {showIngredients && (
                <div className="mt-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-3">
              <button className="btn btn-danger w-100" onClick={() => setShowInstructions(!showInstructions)}>
                Instructions
              </button>
              {showInstructions && (
                <div className="mt-3">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </div>
              )}
            </div>
            <div className="row">
              <div className="col">
                <button className="btn btn-primary w-100" onClick={handleShow}>
                  <div className="d-inline mr-1">
                    <AiOutlineShareAlt size={20} />
                  </div>
                  <div className="d-inline">{recipeShared ? "Shared" : "Share"}</div>
                </button>
              </div>
              <div className="col">
                <button
                  className="btn btn-success w-100"
                  onClick={() => {
                    props.handleSaveClick();
                    setRecipeSaved(true);
                  }}>
                  <div className="d-inline mr-1">
                    <BiSave size={20} />
                  </div>
                  <div className="d-inline">{recipeSaved ? "Saved" : "Save"}</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div>
        <ShareRecipeModal
          show={show}
          userCreatedRecipe={props.userCreatedRecipe}
          handleClose={handleClose}
          handleSaveClick={props.handleSaveClick}
          setRecipeSaved={setRecipeSaved}
          setRecipeShared={setRecipeShared}
        />
      </div>
    </div>
  );
}
