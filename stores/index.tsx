// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import counterForm from "@/slices/forms/counterForm";
import counterPrefix from '@/slices/prefix/counterPrefix';
import { persistStore, persistReducer } from 'redux-persist';
import { createPersistStorage } from './noopstorage'; // Import your function

const formPersistConfig = {
  key: 'form',
  storage: createPersistStorage(), // Use the function here
};

const prefixPersistConfig = {
  key: 'prefix',
  storage: createPersistStorage(), // Use the function here
};

const formReducer = persistReducer(formPersistConfig, counterForm);
const prefixReducer = persistReducer(prefixPersistConfig, counterPrefix);

const store = configureStore({
  reducer: {
    form: formReducer,
    prefix: prefixReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
