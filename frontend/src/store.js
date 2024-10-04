import { legacy_createStore as createStore } from "redux";

// Define initial state
const initialState = {
  isDarkMode: localStorage.getItem("isDarkMode") === "true",
};

// Create a reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "TOGGLE_DARK_MODE": {
      const newDarkModeState = !state.isDarkMode;
      localStorage.setItem("isDarkMode", newDarkModeState);
      return { ...state, isDarkMode: newDarkModeState };
    }
    case "SET_USER": {
      return { ...state, user: action.payload };
    }
    default:
      return state;
  }
};

// Create the Redux store
const store = createStore(reducer);

export default store;
