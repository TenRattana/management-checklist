import { configureStore } from "@reduxjs/toolkit";
import counterForm from "@/slices/forms/counterForm";
import counterPrefix from '@/slices/prefix/counterPrefix'
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const formPersist = {
  key: 'form',
  storage,
};

const prefixPersist = {
  key: 'prefix',
  storage,
};

const formReducer = persistReducer(formPersist, counterForm);
const prefixReducer = persistReducer(prefixPersist, counterPrefix);

const store = configureStore({
  reducer: {
    form: formReducer,
    prefix: prefixReducer
  },
});

const persistor = persistStore(store);

export { store, persistor };
