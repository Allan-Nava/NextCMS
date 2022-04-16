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
