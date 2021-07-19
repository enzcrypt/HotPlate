import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function RecipeCard(props) {
  const { setRecipeID } = useAuth();

  return (
    <div>
      <div className="recipeShare mb-4">
        {props.image === null ? (
          <img src="noimage.jpg" />
        ) : (
          <img className="recipeImagePost card-img-top" src={props.recipeImage} alt="recipe" />
        )}
        <h3 className="recipeTitlePost d-inline-block">{props.recipeTitle}</h3>
      </div>
      <Link to="/more-info">
        <button className="btn btn-more-info btn-sm w-100" onClick={() => setRecipeID(props.recipeID)}>
          More Info
        </button>
      </Link>
    </div>
  );
}
