import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "./asyncHandler.js";

// --------AUTH USER---------
const authenticate = asyncHandler(async (req, res, next) => {
    let token;

    // Read JWT from 'jwt' cookie
    console.log("cookie: ", req.cookies);
    console.log(process.env.JWT_SECRET);
    token = req.cookies.jwt;
    console.log(req.cookies.jwt);
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select("-password");
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token failed.");
        }
    } else {
        res.status(401);
        throw new Error("Not authorized, no token.");
    }
});

// ---------AUTH ADMIN --------
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).send("Not authorized as an admin.");
    }
};

export { authenticate, authorizeAdmin };
