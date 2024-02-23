import Listing from "../models/listing.model.js"
import { errorHandler } from "../util/error.js";

export const createListing = async (req, resp, next) => {
    try {
        const listing = await Listing.create(req.body);
        return resp.status(201).json(listing);
    } catch (error) {
        next(error);
    }
}

export const deleteListing = async (req, resp, next) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        return next(errorHandler(404, "Listing not found"));
    }

    if (req.user.id !== listing.userRef) {
        return next(errorHandler(403, "You do not have permission to perform this action"));
    }

    try {
        await Listing.findByIdAndDelete(req.params.id);
        resp.status(200).json("listing has been deleted");
    } catch (error) {
        next(error);
    }
};

export const updateListing = async (req, resp, next) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        return next(errorHandler(404, "Listing not found"));
    }

    if (req.user.id !== listing.userRef) {
        return next(errorHandler(403, "You do not have permission to perform this action"));
    }

    try {
        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        resp.status(200).json(updatedListing);
    } catch (error) {
        next(error)
    }
}

export const getListing = async (req, resp, next) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return next(errorHandler(404, "No listing found"));
        }
        resp.status(200).json(listing)
    } catch (error) {
        next(error)
    }
}

export const getListings = async (req, resp, next) => {
    try {
        const limit = parseInt(req.query.limit) || 9;
        const startIndex = parseInt(req.query.startIndex) || 0;

        let offer = req.query.offer;
        if (offer === undefined || offer === "false") {
            offer = { $in: [false, true] };
        }

        let furnished = req.query.furnished;
        if (furnished === undefined || furnished === "false") {
            furnished = { $in: [false, true] };
        }

        let parking = req.query.parking;
        if (parking === undefined || parking === "false") {
            parking = { $in: [false, true] };
        }

        let type = req.query.type;
        if (type === undefined || type === "all") {
            type = { $in: ["sale", "rent"] };
        }

        const searchTerm = req.query.searchTerm || "";

        const sort = req.query.sort || "createdAt";

        const order = req.query.order || "desc";

        const listings = await Listing.find({
            name: { $regex: searchTerm, $options: 'i' },
            offer,
            furnished,
            parking,
            type,
        }).sort({ [sort]: order }).limit(limit).skip(startIndex);

        return resp.status(200).json(listings)
    } catch (error) {
        next(error)
    }
}
