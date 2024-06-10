import { createSlice } from "@reduxjs/toolkit";

export const screens = createSlice({
    name: 'activeScreen',
    initialState : {
        value: 'MainScreen'
    },

    reducers : {
        changeScreen : (state, action) => {
            state.value = action.payload;
        }
    }
})

export const {changeScreen} = screens.actions;
export const screenReducer = screens.reducer;
