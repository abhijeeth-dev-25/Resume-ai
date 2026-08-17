const userModel = require("../models/user.model");
const blacklistModel = require("../models/blacklist.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1 day in ms
};

/**
 * @name registerUserController
 * @description Register a new user, returns a JWT cookie on success.
 * @public
 */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password."
            });
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "An account with this username or email already exists."
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hashPassword,
        });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, COOKIE_OPTIONS);

        return res.status(201).json({
            message: "User registered successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        });

    } catch (error) {
        console.error("registerUserController error:", error);
        return res.status(500).json({
            message: "Registration failed. Please try again.",
            error: error.message
        });
    }
}

/**
 * @name loginUserController
 * @description Authenticate user credentials, returns a JWT cookie on success.
 * @public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password."
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, COOKIE_OPTIONS);

        return res.status(200).json({
            message: "User logged in successfully.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            }
        });

    } catch (error) {
        console.error("loginUserController error:", error);
        return res.status(500).json({
            message: "Login failed. Please try again.",
            error: error.message
        });
    }
}

/**
 * @name logoutUserController
 * @description Blacklists the current JWT and clears the cookie.
 * @public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token;

        if (token) {
            await blacklistModel.create({ token });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return res.status(200).json({
            message: "User logged out successfully."
        });

    } catch (error) {
        console.error("logoutUserController error:", error);
        return res.status(500).json({
            message: "Logout failed.",
            error: error.message
        });
    }
}

/**
 * @name getMeController
 * @description Returns the currently authenticated user's details.
 * @private
 */
async function getMeController(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        const user = await userModel.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json({
            message: "User details fetched successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        });

    } catch (error) {
        console.error("getMeController error:", error);
        return res.status(500).json({
            message: "Failed to fetch user details.",
            error: error.message
        });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
};