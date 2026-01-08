import { combineReducers, configureStore } from "@reduxjs/toolkit";
import productReducer from './productSlice';


export const store = configureStore({
    reducer: {
      product: productReducer,  // Tutaj łączymy reducer produktu
    },
  });


export default store;