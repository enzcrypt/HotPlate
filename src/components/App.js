import React from "react";
import SignUp from "./auth/SignUp";
import SignIn from "./auth/SignIn";
import ForgotPassword from "./auth/ForgotPassword";
import UpdateProfile from "./auth/UpdateProfile";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import MoreInfo from "./Food/MoreInfo";
import Feed from "./Feed/Feed";
import NavBar from "./nav/NavBar";
import Profile from "./profile/Profile";
import RecipeSearch from "./Food/RecipeSearch";
import Chat from "./Chat/Chat";
import CreateRecipe from "./create-recipe/CreateRecipe";
import MyFavourites from "./Food/MyFavourites";
import MyRecipes from "./Food/MyRecipes";
import DashboardNotSignedIn from "./DashboardNotSignedIn";
import { useAuth } from "../contexts/AuthContext";
import SignedOutNavBar from "./nav/SignedOutNavBar";

function App() {
  const { currentUser } = useAuth();

  return (
    <div className="App">
      <Router>
        {currentUser ? <NavBar /> : <SignedOutNavBar />}
        <br />
        <Switch>
          <PrivateRoute path="/create-recipe" component={CreateRecipe} />
          <PrivateRoute path="/my-favourites" component={MyFavourites} />
          <PrivateRoute path="/my-recipes" component={MyRecipes} />
          <PrivateRoute path="/chat" component={Chat} />
          <PrivateRoute path="/more-info" component={MoreInfo} />
          <PrivateRoute path="/profile" component={Profile} />
          <Route path="/sign-up" component={SignUp} />
          <Route path="/sign-in" component={SignIn} />
          <PrivateRoute path="/update-profile" component={UpdateProfile} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <PrivateRoute path="/feed" component={Feed} />
          <PrivateRoute path="/recipe-search" component={RecipeSearch} />
          {currentUser ? (
            <PrivateRoute exact path="/" component={RecipeSearch} />
          ) : (
            <Route exact path="/" component={DashboardNotSignedIn} />
          )}
        </Switch>
      </Router>
    </div>
  );
}

export default App;
