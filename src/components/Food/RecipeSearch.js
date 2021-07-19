import React, { useEffect, useState } from "react";
import RecipeFilters from "./RecipeFilters";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import app from "../../firebase";
import LoadingFullScreen from "../LoadingFullScreen";

export default function RecipeSearch() {
  const [apiData, setApiData] = useState([]);
  const [recipeNum, setRecipeNum] = useState(0);
  const [isFetched, setIsFetched] = useState(false);
  const [error, setError] = useState(null);
  const [cuisine, setCuisine] = useState("");
  const [mealType, setMealType] = useState("");
  const [intolerance, setIntolerance] = useState([]);
  const [diet, setDiet] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const size = "636x393.jpg";
  const basePath = "https://spoonacular.com/recipeImages/";
  const { setRecipeID } = useAuth();
  const ref = app.firestore().collection("userAPIRecipes");
  const { currentUser } = useAuth();
  const [userDetails, setUserDetails] = useState({});
  const [filtersCount, setFiltersCount] = useState(0);

  // call getRandomRecipes() when the page loads
  useEffect(() => {
    getRandomRecipes();
    getUserDetails();
  }, []);

  // this functions requests random recipes from spoonacular
  const getRandomRecipes = async () => {
    let API_URL = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/random?number=10&rapidapi-key=${process.env.REACT_APP_API_KEY}`;
    try {
      const resp = await axios.get(API_URL);
      setApiData(resp.data.recipes);
      setIsFetched(true);
    } catch (error) {
      setIsFetched(false);
      setErrorMsg(error);
    }
  };
  //get user details to know where to save the recipe on firestore
  const getUserDetails = () => {
    app
      .firestore()
      .collection("Users")
      .doc(currentUser.email)
      .get()
      .then((doc) => {
        setUserDetails(doc.data());
      })
      .catch((error) => {
        throw error;
      });
  };

  // this function requests filtered recipes from spoonacular
  const getFilteredRecipes = async () => {
    let API_URL = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch?diet=${diet}&intolerances=${intolerance}&type=${mealType}&cuisine=${cuisine}&maxReadyTime=1000&number=10&sort=random&information&rapidapi-key=${process.env.REACT_APP_API_KEY}`;
    try {
      const resp = await axios.get(API_URL);
      // if there are no results from filtered search
      if (resp.data.results.length < 1) {
        setErrorMsg("Sorry, no search results for those filters.."); // set the error message to be displayed
        setApiData(resp.data.results);
        // otherwise
      } else {
        setApiData(resp.data.results);
      }
      setIsFetched(true);
    } catch (error) {
      setIsFetched(false);
      setErrorMsg(error);
    }
  };

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
          if (docSnapshot.exists) {
            alert("Recipe already saved!");
            nextRecipe();
          } else {
            apiref.doc(id.toString()).set({
              id: id,
              title: title,
              image: image,
              ingredients: ingred,
              instructions: instruct,
              fromAPI: true,
            });
            alert("Saved to Favourites");
            nextRecipe();
          }
        });
    } else {
      alert("Please Sign-in to start saving recipes.");
    }
  };

  // if we are at the end of the array set recipeNum to 0 otherwise increment recipeNum by 1
  const nextRecipe = () => {
    setErrorMsg("");
    if (recipeNum === apiData.length - 1) {
      setIsFetched(false);
      setRecipeNum(0);
      if(filtersCount === 0) getRandomRecipes();
      else getFilteredRecipes(); 
      // will need to handle what happens when we reach the end of the array with both random recipes and filtered recipes...
    } else {
      setRecipeNum(recipeNum + 1);
    }
  };
  
  function countFilters(){
    let count = 0;
    count+= intolerance.length;
    if(cuisine.length>0) {
      count++;
    }
    if(mealType.length>0) count++;
    if(diet.length>0) count++;
    setFiltersCount(count);
  }

  // some onChange handler functions for the the different form inputs
  const updateCuisine = (e) => setCuisine(e.target.value);
  const updateDiet = (e) => setDiet(e.target.value);
  const resetIntolerance = () => {
    setIntolerance([]);
    document.querySelectorAll('input[type=checkbox]').forEach(el => el.checked=false);
  }
  const updateIntolerance = (added, value) => {
    if (added) {
      setIntolerance((intolerance) => [...intolerance, value]);
    } else {
      var newAr = intolerance;
      newAr.splice(intolerance.indexOf(value), 1);
      setIntolerance(newAr);
    }
    // countFilters();
  };
  const updateMealType = (e) => setMealType(e.target.value);

  // sets state variables to empty strings
  const removeFilters = () => {
    setCuisine("");
    setDiet("");
    setIntolerance([]);
    setMealType("");
    document.querySelectorAll('input[type=checkbox]').forEach(el => el.checked=false);
    countFilters();
  };

  // if the data is not yet fetched
  if (isFetched === false) {
    return <LoadingFullScreen />;
    // or if there is an error with the API request
  } else if (apiData.length < 1) {
    return (
      <div className="container d-flex justify-content-center" style={{ minHeight: "100%" }}>
        <div className="w-100" style={{ maxWidth: "450px" }}>
          <div className="card">
            <div className="card-body">
              {errorMsg && (
                <div className="alert alert-danger" role="alert">
                  {errorMsg}
                </div>
              )}
              <div className="mb-3">
                <h6 className="card-title mb-3">Get random recipes or change filters</h6>
                <button className="btn btn-success w-100" onClick={getRandomRecipes}>
                  Random
                </button>
              </div>
              <div>
                <RecipeFilters
                  updateCuisine={updateCuisine}
                  updateDiet={updateDiet}
                  updateMealType={updateMealType}
                  updateIntolerance={updateIntolerance}
                  getFilteredRecipes={getFilteredRecipes}
                  removeFilters={removeFilters}
                  resetIntolerance={resetIntolerance}
                  cuisine={cuisine}
                  mealType={mealType}
                  intolerance={intolerance}
                  diet={diet}
                  filtersCount={filtersCount}
                  countFilters={countFilters}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    // if there is an api request error
  } else if (error) {
    return (
      <div className="card">
        <div className="card-body col text-center">
          <span>
            <b>API Call Error</b>
          </span>
          <img src="https://pixy.org/src/69/thumbs350/692078.jpg" className="img-fluid img-thumbnail" alt="error"></img>
        </div>
      </div>
    );
  } else {
    // otherwise, we have data
    return (
      <div className="container d-flex justify-content-center" style={{ minHeight: "100%" }}>
        <div className="w-100" style={{ maxWidth: "450px" }}>
          <div className="card">
            {apiData[recipeNum].image === null ? (
              <img className="card-img-top" src="noimage.jpg" />
            ) : (
              <img className="card-img-top" src={`${basePath}${apiData[recipeNum].id}-${size}`} alt="recipe" />
            )}
            <div className="card-body">
              <h4 className="card-title">{apiData[recipeNum].title}</h4>
              <div>
                <button type="button" className="btn btn-danger w-50 mb-3" onClick={nextRecipe}>
                  Next
                </button>
                <button
                  type="button"
                  className="btn btn-success w-50 mb-3"
                  onClick={() =>
                    saveAPIRecipe(
                      apiData[recipeNum].id,
                      apiData[recipeNum].title,
                      apiData[recipeNum].image,
                      apiData[recipeNum].extendedIngredients,
                      apiData[recipeNum].analyzedInstructions
                    )
                  }>
                  Save
                </button>
              </div>
              <div>
                <Link to="/more-info">
                  <button
                    type="button"
                    className="btn btn-warning w-100 mb-3"
                    onClick={() => setRecipeID(apiData[recipeNum].id)}>
                    More Info
                  </button>
                </Link>
              </div>
              <div>
                <RecipeFilters
                  updateCuisine={updateCuisine}
                  updateDiet={updateDiet}
                  updateMealType={updateMealType}
                  updateIntolerance={updateIntolerance}
                  getFilteredRecipes={getFilteredRecipes}
                  removeFilters={removeFilters}
                  resetIntolerance={resetIntolerance}
                  cuisine={cuisine}
                  mealType={mealType}
                  intolerance={intolerance}
                  diet={diet}
                  filtersCount={filtersCount}
                  countFilters={countFilters}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
