import { configureStore } from "@reduxjs/toolkit";
import counterForm from "../slices/forms/counterForm";

export const store = configureStore({
  reducer: {
    form: counterForm,
  },
});
