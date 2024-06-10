import { createSlice } from "@reduxjs/toolkit";

export const typeStats = createSlice({
    name: 'wpm',
    initialState: {
        value: 0
    },

    reducers: {
        wpmResult : (state, action) => {
            state.value = action.payload;
        },
    },
})


export const {wpmResult} = typeStats.actions;
export const wpmReducer = typeStats.reducer;