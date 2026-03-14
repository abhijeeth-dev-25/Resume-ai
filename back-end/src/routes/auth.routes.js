const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = express.Router();

/**
 * @route Post /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post('/register',authController.registerUserController); //"Hey Express, when /register is called,run this function."

/**
 * @route Post /api/auth/login
 * @desc Login a user
 * @access Public
 */
authRouter.post('/login', authController.loginUserController); // reference to the loginUserController function in auth.controller.js file. "Hey Express, when /login is called, run this function."

/**
 * @route Get /api/auth/logout
 * @desc Logout a user
 * @access Public
 */
authRouter.get('/logout', authController.logoutUserController);

/**
 * @route Get /api/auth/get-me
 * @desc Get the details of the logged in user
 * @access Private  
 */
authRouter.get('/get-me', authMiddleware.authUserMiddleware, authController.getMeController); // "Hey Express, when /get-me is called, first run the authUserMiddleware function to check if the user is authenticated, and if they are, then run the getMeController function to get the user's information."


module.exports = authRouter;