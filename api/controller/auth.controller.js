import User from "../models/users.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../util/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, resp, next) => {
    const { username, email, password } = req.body;
    const hassPassword = bcryptjs.hashSync(password, 5);
    const newUser = new User({ username, email, password: hassPassword });
    try {
        if (newUser) {
            const result = await newUser.save();
            resp.send(result);
        } else resp.send("No user found");
    } catch (error) {
        next(error);
    }
};

export const signin = async (req, resp, next) => {
    const { username, password } = req.body;
    try {
        const validUser = await User.findOne({ username });
        if (!validUser) return next(errorHandler(404, "User not found"));
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) return next(errorHandler(401, "Invalid password"));
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
        const { password: pass, ...rest } = validUser._doc;
        resp
            .cookie("access_token", token, { httpOnly: true })
            .status(200)
            .json(rest);
    } catch (error) {
        next(error);
    }
};

export const google = async (req, resp, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = user._doc;
            resp
                .cookie("access_token", token, { httpOnly: true })
                .status(200)
                .json(rest);
        } else {
            const generatePssword = Math.random().toString(36).slice(-8);
            const hashPassword = bcryptjs.hashSync(generatePssword, 5);
            const newUser = new User({ username: req.body.name.split(" ").join("").toLowerCase(), email: req.body.email, password: hashPassword, profPhoto: req.body.photo });
            await newUser.save();
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = newUser._doc;
            resp
                .cookie("access_token", token, { httpOnly: true })
                .status(200)
                .json(rest);
        }
    } catch (error) {
        next(error);
    }
};

export const signout = async (req, resp, next) => {
    try {
        resp.clearCookie("access_token");
        resp.status(200).json("User has been signed out...")
    } catch (error) {
        next(error)
    }
}
