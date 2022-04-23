/*
 * File: store.ts
 * Project: next-cms
 * File Created: Monday, 18th April 2022 10:55:41 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 23rd April 2022 3:22:34 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
//
import layoutReducer from '../reducers/layout/reducer';
import dragAndDropReducer from '../reducers/dragAndDrop/reducer';
//
//
export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    dragAndDrop: dragAndDropReducer,
  },
});
//
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;