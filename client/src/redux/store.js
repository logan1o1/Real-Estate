import { combineReducers, configureStore } from '@reduxjs/toolkit'
import userReducer from './user/userSlice'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage';


const loggerMiddleware = (store) => (next) => (action) => {
  console.log('Dispatching action:', action);
  const result = next(action);
  console.log('New state:', store.getState());
  return result;
};
const customMiddleware = [loggerMiddleware];


const rootReducer = combineReducers({
  user: userReducer
})
const persistConfig = {
  key: 'root',
  storage,
  version: 1,
}
const persistedReducer = persistReducer(persistConfig, rootReducer)


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    }).concat(customMiddleware)
  }
})

export const persistor = persistStore(store)