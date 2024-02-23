import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    profPhoto: {
        type: String,
        default: "https://t3.ftcdn.net/jpg/04/17/42/50/360_F_417425057_Xwor2V8dV1MP6EysYr6rShFJwBMASGDq.jpg"
    },
}, {timestamps: true})

const User = mongoose.model("users", userSchema)

export default User;