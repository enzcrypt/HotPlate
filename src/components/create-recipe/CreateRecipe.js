import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import app from "../../firebase";
import { useFormik } from "formik";
import * as Yup from "yup";
import { BsTrash } from "react-icons/bs";
import DisplayUserCreatedRecipe from "./DisplayUserCreatedRecipe";
import { v4 as uuidv4 } from "uuid";

export default function CreateRecipe() {
  const [fileURL, setFileURL] = useState(null);
  const { currentUser } = useAuth();
  const [fileName, setFileName] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [instruction, setInstruction] = useState("");
  const [instructionsArray, setInstructionsArray] = useState("");
  const [ingredientsArray, setIngredientsArray] = useState("");
  const [userCreatedRecipe, setUserCreatedRecipe] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [errorMsg, setErrorMsg] = useState();

  const ref = app.firestore().collection("userCreatedRecipes");
  const userRef = app.firestore().collection("Users");

  // formik handles the form inputs and Yup validates the inputs
  const formik = useFormik({
    initialValues: {
      title: "",
      image: "",
      description: "",
      ingredients: [],
      instructions: [],
      id: "CR-" + uuidv4(),
      authorUID: currentUser.uid,
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Required"),
      image: Yup.mixed().required("Required"),
      description: Yup.string().required("Required"),
      ingredients: Yup.array().min(1).required("Required"),
      instructions: Yup.array().min(1).required("Required"),
    }),
    onSubmit: async (values) => {
      getUserCreatedRecipe(values);
    },
  });

  const handleSaveClick = () => {
    ref
      .doc(formik.values.id)
      .set(formik.values)
      .then(() => {
        alert("Custom Recipe Saved.");
      })
      .catch((error) => {
        throw error;
      });
  };

  // uploads a file and adds it to firebase storage
  const handleFileChange = async (e) => {
    setFileName("");
    const file = e.target.files[0];
    const fileNameArray = file?.name.split(".");
    if (fileNameArray.length == 0 || !fileNameArray)
      return setErrorMsg("Bad file: please ensure it is a .jpg or .png file");
    if (!["jpg", "jpeg", "png"].includes(fileNameArray[fileNameArray.length - 1].toLowerCase()))
      return setErrorMsg("Only png and jpg files are supported."); // check file type
    setFileName(file.name);
    const uniqueFileName = uuidv4().toString() + "." + fileNameArray[fileNameArray.length - 1];
    setErrorMsg("");
    const storageRef = app.storage().ref(); //firebase storage ref
    const fileRef = storageRef.child(uniqueFileName);
    await fileRef.put(file); // put file in storage
    setFileURL(await fileRef.getDownloadURL());
    formik.setFieldValue("image", await fileRef.getDownloadURL());
  };

  // sets ingredient to the user input
  const handleIngredientsChange = (e) => {
    setIngredient(e.target.value);
  };

  // appeneds new ingredient to the ingredientsArray when user clicks add button
  const handleAddIngredientClick = () => {
    const newItems = [...ingredientsArray, ingredient];
    if (!/^\s*$/.test(newItems[newItems.length - 1])) {
      setIngredientsArray(newItems);
      formik.setFieldValue("ingredients", newItems);
      setIngredient("");
    }
  };

  // sets instruction to the user input
  const handleInstructionsChange = (e) => {
    setInstruction(e.target.value);
  };

  // appeneds new instruction to the instructionsArray when user clicks add button
  const handleAddInstructionClick = () => {
    const newItems = [...instructionsArray, instruction];
    if (!/^\s*$/.test(newItems[newItems.length - 1])) {
      setInstructionsArray(newItems);
      formik.setFieldValue("instructions", newItems);
      setInstruction("");
    }
  };

  // deletes an ingredient from the ingredientsArray at a specified index
  const handleDeleteIngredientClick = (index) => {
    const newItems = ingredientsArray.filter((item, itemIndex) => itemIndex !== index);
    setIngredientsArray(newItems);
  };

  // deletes an instruction from the ingredientsArray at a specified index
  const handleDeleteInstructionClick = (index) => {
    const newItems = instructionsArray.filter((item, itemIndex) => itemIndex !== index);
    setInstructionsArray(newItems);
  };

  // gets the current users created recipe from firestore
  const getUserCreatedRecipe = (values) => {
    let tempArr = [];
    tempArr.push(values);
    setUserCreatedRecipe(tempArr);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-6 col-sm-12 mb-3">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Create Your Own Recipe</h3>
              <form onSubmit={formik.handleSubmit}>
                {/* ================ RECIPE IMAGE HERE ================== */}

                <div className="mb-3">
                  <div className="custom-file">
                    <input
                      type="file"
                      className={`${formik.touched.image && formik.errors.image && "custom-file-input is-invalid"} ${
                        formik.touched.image && !formik.errors.image
                          ? "custom-file-input is-valid"
                          : "custom-file-input"
                      }`}
                      id="image"
                      name="image"
                      onChange={handleFileChange}
                      onBlur={formik.handleBlur}
                    />
                    {fileName ? (
                      <label className="custom-file-label" htmlFor="image">
                        {fileName}
                      </label>
                    ) : (
                      <label className="custom-file-label" htmlFor="image">
                        Choose recipe image...
                      </label>
                    )}
                    {errorMsg && (
                      <div className="alert alert-danger" role="alert">
                        {errorMsg}
                      </div>
                    )}
                    {formik.touched.image && formik.errors.image ? (
                      <div className="invalid-feedback">{formik.errors.image}</div>
                    ) : null}
                  </div>
                </div>

                {/* ================ TITLE ================== */}

                <div className="mb-3">
                  <label htmlFor="title">Recipe Title</label>
                  <input
                    className={`${formik.touched.title && formik.errors.title && "form-control is-invalid"} ${
                      formik.touched.title && !formik.errors.title ? "form-control is-valid" : "form-control"
                    }`}
                    placeholder="Enter title"
                    id="title"
                    name="title"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.title}></input>
                  {formik.touched.title && formik.errors.title ? (
                    <div className="invalid-feedback">{formik.errors.title}</div>
                  ) : null}
                </div>

                {/* ================ DESCRIPTION ================== */}

                <div className="mb-3">
                  <label htmlFor="description">Description</label>
                  <input
                    className={`${
                      formik.touched.description && formik.errors.description && "form-control is-invalid"
                    } ${
                      formik.touched.description && !formik.errors.description
                        ? "form-control is-valid"
                        : "form-control"
                    }`}
                    placeholder="Enter description"
                    id="description"
                    name="description"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.description}></input>
                  {formik.touched.description && formik.errors.description ? (
                    <div className="invalid-feedback">{formik.errors.description}</div>
                  ) : null}
                </div>

                {/* ================ INGREDIENTS ================== */}

                <div className="d-flex justify-content-between mb-3">
                  <div>
                    <label htmlFor="ingredients">Add Ingredients</label>
                    <input
                      className={`${
                        formik.touched.ingredients && formik.errors.ingredients && "form-control is-invalid"
                      } ${
                        formik.touched.ingredients && !formik.errors.ingredients
                          ? "form-control is-valid"
                          : "form-control"
                      }`}
                      placeholder="Enter ingredients"
                      id="ingredients"
                      name="ingredients"
                      type="text"
                      onChange={handleIngredientsChange}
                      onBlur={formik.handleBlur}
                      value={ingredient}></input>
                    {formik.touched.ingredients && formik.errors.ingredients ? (
                      <div className="invalid-feedback">{formik.errors.ingredients}</div>
                    ) : null}
                  </div>
                  <div className="align-self-center">
                    <button type="button" className="btn btn-success" onClick={handleAddIngredientClick}>
                      Add
                    </button>
                  </div>
                </div>

                {/* ================ DISPLAY INGREDIENTS ================== */}

                <div className="mb-3">
                  {ingredientsArray.length > 0 && (
                    <div>
                      {ingredientsArray.map((ingredient, index) => (
                        <div className="d-flex justify-content-between" key={index}>
                          <li>{ingredient}</li>
                          <div
                            className="mt-auto"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleDeleteIngredientClick(index)}>
                            <BsTrash size={20} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ================ INSTRUCTIONS ================== */}

                <div className="d-flex justify-content-between mb-3">
                  <div>
                    <label htmlFor="instructions">Add Instructions</label>
                    <input
                      className={`${
                        formik.touched.instructions && formik.errors.instructions && "form-control is-invalid"
                      } ${
                        formik.touched.instructions && !formik.errors.instructions
                          ? "form-control is-valid"
                          : "form-control"
                      }`}
                      placeholder="Enter instructions"
                      id="instructions"
                      name="instructions"
                      type="text"
                      onChange={handleInstructionsChange}
                      onBlur={formik.handleBlur}
                      value={instruction}></input>
                    {formik.touched.instructions && formik.errors.instructions ? (
                      <div className="invalid-feedback">{formik.errors.instructions}</div>
                    ) : null}
                  </div>
                  <div className="align-self-center">
                    <button type="button" className="btn btn-success" onClick={handleAddInstructionClick}>
                      Add
                    </button>
                  </div>
                </div>
                {/* ================ DISPLAY INSTRUCTIONS ================== */}

                <div className="mb-3">
                  {instructionsArray.length > 0 && (
                    <div>
                      {instructionsArray.map((instruction, index) => (
                        <div className="d-flex justify-content-between" key={index}>
                          <li>{instruction}</li>
                          <div
                            className="mt-auto"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleDeleteInstructionClick(index)}>
                            <BsTrash size={20} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <button type="submit" className="btn btn-warning w-100">
                    Build
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ================ display the users created recipe ================== */}

        <div className="col-lg-6 col-sm-12">
          {userCreatedRecipe === null ? (
            <div className="card">
              <div className="card-body">
                <h3 className="card-title text-center mb-4">Recipe Preview</h3>
                <h5 className="card-title text-center">Please build your recipe...</h5>
              </div>
            </div>
          ) : (
            <div>
              <DisplayUserCreatedRecipe userCreatedRecipe={userCreatedRecipe} handleSaveClick={handleSaveClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
