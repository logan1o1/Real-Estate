import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    currentUser: null,
    error: null,
    loading: false
}


const userSlice = createSlice({
    name: "user",           // it is the name of our state
    initialState,
    reducers: {
        signinStart: (state) => {
            state.loading = true;
        },
        signinSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.error = null;
            state.loading = false;
        },
        signinFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        updateUserStart: (state) => {
            state.loading = true;
        },
        updateUserSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        updateUserFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        deleteUserStart: (state) => {
            state.loading = true;
        },
        deleteUserSuccess: (state, action) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        },
        deleteUserFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        signoutUserStart: (state) => {
            state.loading = true;
        },
        signoutUserSuccess: (state, action) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        },
        signoutUserFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    }
})

export const {signinStart, signinSuccess, signinFailure, updateUserFailure, updateUserStart, updateUserSuccess, deleteUserStart, deleteUserSuccess, deleteUserFailure, signoutUserStart, signoutUserSuccess, signoutUserFailure} = userSlice.actions;
export default userSlice.reducer;