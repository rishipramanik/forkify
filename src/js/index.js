/*import str from "./models/Search";
//import { add as a, multiply as m, ID } from "./views/searchView";
import * as searchView from "./views/searchView";

console.log(
  `Using imported func ${searchView.add(
    searchView.ID,
    2
  )} and ${searchView.multiply(3, 5)}. ${str}`
);*/
import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";
import Likes from "./models/Likes";

/** Global state of the app
 * search object
 * current recipe object
 * shopping list object
 * liked recipes
 */
const state = {};
window.state = state;
//Search Controller
const controlSearch = async () => {
  //Get query from view
  const query = searchView.getInput();
  //const query = "pizza";

  if (query) {
    //new search object and add to state
    state.search = new Search(query);

    // prepare UI for
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      //search for recipes
      await state.search.getResults();

      //render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      alert("Something Went wrong in Search..");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});
/*testing
window.addEventListener("load", (e) => {
  e.preventDefault();
  controlSearch();
});*/

elements.searchResPages.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

//recipe controller

/*const r = new Recipe(47746);
r.getRecipe();
console.log(r);*/
const controlRecipe = async () => {
  //get id from URL
  const id = window.location.hash.replace("#", "");
  console.log(id);

  if (id) {
    //prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //highlight selected search item
    if (state.search) searchView.highlightSelected(id);

    //create new recipe object
    state.recipe = new Recipe(id);
    //testing
    // window.r = state.recipe;

    try {
      //get recipe data and parse Ingredients
      await state.recipe.getRecipe();
      //console.log(state.recipe.ingredients);
      state.recipe.parseIngredients();

      //calculate servings time
      state.recipe.calcTime();
      state.recipe.calcServings();

      //render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (err) {
      console.log(err);
      alert("Error Processing recipe");
    }
  }
};

//window.addEventListener("hashchange", controlRecipe);
//window.addEventListener("load", controlRecipe);
["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

//LIST CONTROLLER
const controlList = () => {
  //create new list
  if (!state.list) state.list = new List();

  //add ing to list
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

//handle delete and updae item events
elements.shopping.addEventListener("click", (e) => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  //handle the delete button
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    //delete from state
    state.list.deleteItem(id);

    //delete from UI
    listView.deleteItem(id);

    //handle the count update
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

//LIKE CONTROLLER

state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  //user hasn't likes
  if (!state.likes.isLiked(currentID)) {
    //Add like
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    //toggle Like btn
    likesView.toggleLikeBtn(true);

    //add like to the UI list
    likesView.renderLike(newLike);
    //console.log(state.likes);

    //user has liked
  } else {
    //remove like
    state.likes.deleteLike(currentID);
    //toggle Like btn
    likesView.toggleLikeBtn(false);
    //remove like to the UI list
    //console.log(state.likes);
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//handeling recipe button clicks
elements.recipe.addEventListener("click", (e) => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    if (state.recipe.serving > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *"))
    //like controller
    controlLike();
});

window.l = new List();
