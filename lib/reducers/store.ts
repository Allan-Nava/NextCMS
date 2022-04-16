import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

import layoutReducer from '../reducers/layout/reducer';
import dragAndDropReducer from '../reducers/dragAndDrop/reducer';


export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    dragAndDrop: dragAndDropReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;