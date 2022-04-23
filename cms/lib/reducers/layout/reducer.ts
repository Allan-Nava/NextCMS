/*
 * File: reducer.ts
 * Project: next-cms
 * File Created: Tuesday, 19th April 2022 10:56:57 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 23rd April 2022 3:22:57 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { PageComponent } from '../../types/page';
//
const initialState = {
  components: [] as PageComponent[],
}
//
export const layoutReducer = createSlice({
  name: "layout",
  initialState,
  reducers: {
    insertItem: (state, action: PayloadAction<{ index: number, item: PageComponent }>) => {
      const { index, item } = action.payload;

      state.components = [
        ...state.components.slice(0, index),
        item,
        ...state.components.slice(index)
      ];
    },
    removeItem: (state, action: PayloadAction<{ index: number }>) => {
      const { index } = action.payload;

      state.components = [
        ...state.components.slice(0, index),
        ...state.components.slice(index + 1)
      ];
    },
    moveItem : (state, action: PayloadAction<{ from: number, to: number }>) => {
      const { from, to } = action.payload;
      const item = state.components.splice(from, 1)[0];
      state.components.splice(to, 0, item);
    } 
  }
})

export const {insertItem, removeItem, moveItem} = layoutReducer.actions

export const selectLayout = (state: RootState) => state.layout;

export default layoutReducer.reducer
