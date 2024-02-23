import Listing from "../models/listing.model.js";
import User from "../models/users.model.js";
import { errorHandler } from "../util/error.js";
import bcryptjs from "bcryptjs";

export const updateUser = async (req, resp, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "Not authorized to update this acc"));

  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 5);

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            profPhoto: req.body.profPhoto,
          },
        },
        { new: true }
      );

      const { password, ...rest } = updatedUser._doc;

      resp.status(200).json(rest);
    } else{
        next(errorHandler(402, "Please fill the password section with the correct password before updating, for security purposes"))
    }
  } catch (error) {
    next(error);
  }
};


export const deleteUser = async (req, resp, next) => {
  if (req.user.id !== req.params.id) next(errorHandler(401, "you can only delete your own account"));
  try {
    await User.findByIdAndDelete(req.params.id);
    resp.status(200).clearCookie("access_token").json("User has been deleted...");
  } catch (error) {
    next(error);
  }
}


export const getUserListings = async (req, resp, next) => {
  if (req.user.id !== req.params.id) next(errorHandler(401, "You can only get your own listings"));
  try {
    const listings = await Listing.find({userRef: req.params.id});
    resp.status(200).json(listings);
  } catch (error) {
    next(error)
  }
}

export const getUser = async (req, resp, next) => {
  const user = await  User.findById(req.params.id);
  if (!user) return next(errorHandler(400, 'No user with that ID'));
  const {password: pass, ...rest} = user._doc
  resp.status(200).json(rest);
}