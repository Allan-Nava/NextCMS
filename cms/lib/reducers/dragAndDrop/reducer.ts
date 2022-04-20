/*
 * File: reducer.ts
 * Project: next-cms
 * File Created: Sunday, 27th March 2022 9:19:11 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 19 April 2022 9:19:13 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

const initialState = {
  dragging: false,
}

export const dragAndDropReducer = createSlice({
  name: "dragAndDrop",
  initialState,
  reducers: {
    dragHandler: (state, action: PayloadAction<{ dragging: boolean }>) => {
      state.dragging = action.payload.dragging;
    }
  }
})

export const { dragHandler} = dragAndDropReducer.actions

export const dragAndDrop = (state: RootState) => state.dragAndDrop;

export default dragAndDropReducer.reducer
