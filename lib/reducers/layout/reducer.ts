import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { PageComponent } from '../../types/page';

const initialState = {
  components: [] as PageComponent[],
}

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
    }
  }
})

export const {insertItem} = layoutReducer.actions

export const selectLayout = (state: RootState) => state.layout;

export default layoutReducer.reducer
