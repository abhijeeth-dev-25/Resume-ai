const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");

const interviewRouter = express.Router();


/**
 * @routes POST /api/interview/
 * @description Generate new interview on the basis of user self description and resume pdf and job description.
 * @access Private
 */
interviewRouter.post("/",authMiddleware.authUserMiddleware,upload.single("resume"),interviewController.generateInterViewReportController)


module.exports = interviewRouter; 