import { configureStore } from "@reduxjs/toolkit";
import {wpmReducer} from '../slices/typeStatsSlice'
import { screenReducer } from "../slices/screenSlice";

const store = configureStore({
    reducer: {
        wpm: wpmReducer,
        screen: screenReducer,
    }
})

export default store;