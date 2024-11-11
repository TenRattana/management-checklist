import { configureStore } from "@reduxjs/toolkit";
import counterForm from "@/slices/forms/counterForm";
import counterPrefix from '@/slices/prefix/counterPrefix';
import couterNav from '@/slices/nav/couterNav';
import { useDispatch } from "react-redux";

export const store = configureStore({
  reducer: {
    user: couterNav,
    form: counterForm,
    prefix: counterPrefix,
  },
});

export type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()