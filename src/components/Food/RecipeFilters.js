import React, { useState } from "react";
import { Modal } from "react-bootstrap";

export default function RecipeFilters(props) {
  const [show, setShow] = useState(false);
  const [showIntolerances, setShowIntolerances] = useState(false);

  // handle closing and opening modal
  const handleCloseFilters = () => {
    setShow(false);
    setShowIntolerances(false);
  }
  const handleShowFilters = () => setShow(true);

    //to Hide the intolerance checkboxes and reset the intolerance array
  const closedIntolerance = () =>{
    setShowIntolerances(!showIntolerances);
  }

  const handleIntoleranceBox = (event) =>{
    const target = event.target;
    const val = target.type === 'checkbox' ? target.checked : target.value;
    
    if (val === true){
      props.updateIntolerance(true, target.value);
    }else{
      props.updateIntolerance(false, target.value);
    }
  }

  return (
    <div>
      <button type="button" className="btn btn-info w-100" onClick={handleShowFilters}>
         { (props.cuisine?.length>0 || props.diet?.length>0 || props.mealType?.length > 0 || props.intolerance.length>0) ?
            "View/Edit Active Filters ("+props?.filtersCount+")"
            : "Set Search Filters"
         }
      </button>
      {}
      <div>
        <Modal show={show} onHide={handleCloseFilters}>
          <Modal.Header closeButton>
            <Modal.Title>Recipe Filters</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <div className="mb-2">
                <label htmlFor="cuisine">
                  <b>Cuisine</b>
                </label>
                <select
                  className="btn btn-light dropdown-toggle w-100"
                  name="cuisine"
                  id="cuisine"
                  value={props.cuisine}
                  onChange={props.updateCuisine}>
                  <option value="">None</option>
                  <option value="african">African</option>
                  <option value="american">American</option>
                  <option value="british">British</option>
                  <option value="cajun">Cajun</option>
                  <option value="caribbean">Caribbean</option>
                  <option value="chinese">Chinese</option>
                  <option value="eastern%20european">Eastern European</option>
                  <option value="european">European</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                  <option value="greek">Greek</option>
                  <option value="indian">Indian</option>
                  <option value="irish">Irish</option>
                  <option value="italian">Italian</option>
                  <option value="japanese">Japanese</option>
                  <option value="jewish">Jewish</option>
                  <option value="korean">Korean</option>
                  <option value="latin%20american">Latin American</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="mexican">Mexican</option>
                  <option value="middle%20eastern">Middle Eastern</option>
                  <option value="nordic">Nordic</option>
                  <option value="southern">Southern</option>
                  <option value="spanish">Spanish</option>
                  <option value="thai">Thai</option>
                  <option value="vietnamese">Vietnamese</option>
                </select>
              </div>
              <div className="mb-2">
                <label htmlFor="diet">
                  <b>Diet</b>
                </label>
                <select
                  className="btn btn-light dropdown-toggle w-100"
                  name="diet"
                  id="diet"
                  value={props.diet}
                  onChange={props.updateDiet}>
                  <option value="">None</option>
                  <option value="gluten%20free">Gluten Free</option>
                  <option value="ketogenic">Ketogenic</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="lacto%20vegetarian">Lacto-Vegetarian</option>
                  <option value="ovo%20vegetarian">Ovo-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="pescetarian">Pescetarian</option>
                  <option value="paleo">Paleo</option>
                  <option value="primal">Primal</option>
                  <option value="whole30">Whole30</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="mealType">
                  <b>Meal Type</b>
                </label>
                <select
                  className="btn btn-light dropdown-toggle w-100"
                  name="mealType"
                  id="mealType"
                  value={props.mealType}
                  onChange={props.updateMealType}>
                  <option value="">None</option>
                  <option value="main%20course">Main Course</option>
                  <option value="side%20dish">Side Dish</option>
                  <option value="dessert">Dessert</option>
                  <option value="appetizer">Appetizer</option>
                  <option value="salad">Salad</option>
                  <option value="bread">Bread</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="soup">Soup</option>
                  <option value="beverage">Beverage</option>
                  <option value="sauce">Sauce</option>
                  <option value="marinade">Marinade</option>
                  <option value="fingerfood">Fingerfood</option>
                  <option value="snack">Snack</option>
                  <option value="drink">Drink</option>
                </select>
              </div>
              <div className="mb-2">
                <label htmlFor="intolerance">
                  <b>Intolerances</b>
                </label>
                {!showIntolerances && <button className="btn btn-success btn-sm float-right" onClick={() =>setShowIntolerances(!showIntolerances)}>Show</button>}
                {showIntolerances && <button className="btn btn-warning btn-sm float-right" onClick={closedIntolerance}>{"Hide"}</button>}
                {showIntolerances && <form>
                  <input type="checkbox" value="dairy" onChange={handleIntoleranceBox} defaultChecked={props.intolerance.includes("dairy") ? true : false} style={{marginRight:"5px"}}/><label>Dairy</label><br/>
                  <input type="checkbox" value="egg" onChange={handleIntoleranceBox} defaultChecked={props.intolerance.includes("egg") ? true : false} style={{marginRight:"5px"}}/><label>Egg</label><br/>
                  <input type="checkbox" value="gluten" onChange={handleIntoleranceBox} defaultChecked={props.intolerance.includes("gluten") ? true : false} style={{marginRight:"5px"}}/><label>Gluten</label><br/>
                  <input type="checkbox" value="grain" onChange={handleIntoleranceBox} defaultChecked={props.intolerance.includes("grain") ? true : false} style={{marginRight:"5px"}}/><label>Grain</label><br/>
                  <input type="checkbox" value="peanut" onChange={handleIntoleranceBox} defaultChecked={props.intolerance.includes("peanut") ? true : false} style={{marginRight:"5px"}}/><label>Peanut</label><br/>
                  <input type="checkbox" value="seafood" onChange={handleIntoleranceBox} defaultChecked={props.intolerance.includes("seafood") ? true : false} style={{marginRight:"5px"}}/><label>Seafood</label><br/>
                  <input type="checkbox" value="sesame" onChange={handleIntoleranceBox} defaultChecked={props.intolerance.includes("sesame") ? true : false} style={{marginRight:"5px"}}/><label>Sesame</label><br/>
                  <input type="checkbox" value="shellfish" onChange={handleIntoleranceBox} defaultChecked={props.intolerance.includes("shellfish") ? true : false} style={{marginRight:"5px"}}/><label>Shellfish</label><br/>
                  <input type="checkbox" value="soy" onChange={handleIntoleranceBox} defaultChecked={props.intolerance.includes("soy") ? true : false} style={{marginRight:"5px"}}/><label>Soy</label><br/>
                  <input type="checkbox" value="sulfite" onChange={handleIntoleranceBox} defaultChecked={props.intolerance.includes("sulfite") ? true : false} style={{marginRight:"5px"}}/><label>Sulfite</label><br/>
                  <input type="checkbox" value="tree%20nut" onChange={handleIntoleranceBox} defaultChecked={props.intolerance.includes("tree%20nut") ? true : false} style={{marginRight:"5px"}}/><label>Tree Nut</label><br/>
                  <input type="checkbox" value="wheat" onChange={handleIntoleranceBox} defaultChecked={props.intolerance.includes("wheat") ? true : false} style={{marginRight:"5px"}}/><label>Wheat</label><br/>
                </form>}
              </div>
            </div>
          </Modal.Body>
              <Modal.Footer>
              { (props.cuisine?.length>0 || props.diet?.length>0 || props.mealType?.length > 0 || props.intolerance.length>0) ?
                <div className="w-100">
                  <p className="text-center"><b>Current Filters:</b></p>
                  {props.cuisine?.length>0 && <p><u>Cuisine:</u> {props.cuisine.split("%20").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>}
                  {props.diet?.length>0 && <p><u>Diet:</u> {props.diet.split("%20").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>}
                  {props.mealType.length>0 && <p><u>Meal Type:</u> {props.mealType.split("%20").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>}
                  {props.intolerance.length>0 && 
                    <p><u>Intolerances:</u>
                    {props.intolerance.map((intol, index) => (
                      <span>{index>0 ? ", " : " "}{intol.split("%20").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                    ))}
                    </p>
                  }
                </div>
                :
                <div className="w-100">
                  <p className="text-center"><b>No active filters!</b></p>
                </div>
              }
              <div>
                <button
                  className="btn btn-success w-100"
                  disabled={!props.cuisine && !props.diet && !props.mealType && props.intolerance.length==0}
                  onClick={() => {
                    props.getFilteredRecipes();
                    setShowIntolerances(false);
                    setShow(false);
                    props.countFilters();
                  }}>
                  Apply Filters
                </button>
              </div>
              <div>
                { (props.cuisine?.length>0 || props.diet?.length>0 || props.mealType?.length > 0 || props.intolerance.length>0) ?
                  <button
                    className="btn btn-warning w-100"
                    onClick={() =>{
                      props.removeFilters();
                    }}>
                    Remove Filters
                  </button>
                :
                  <button
                    className="btn btn-secondary w-100"
                    onClick={() =>{
                      handleCloseFilters();
                      setShowIntolerances(false);
                    }}>
                    Close
                  </button>
                }
              </div>
            </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
