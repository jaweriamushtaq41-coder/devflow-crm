import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  commandPaletteOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setCommandPaletteOpen(state, action) {
      state.commandPaletteOpen = action.payload;
    },
  },
});

export const { toggleSidebar, setCommandPaletteOpen } = uiSlice.actions;
export default uiSlice.reducer;
