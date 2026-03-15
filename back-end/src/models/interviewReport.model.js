const mongoose = require("mongoose");

/**
 *  - job description schema
 *  - resume text
 *  - self description
 * 
 *  - matchScore : Number
 * 
 *  - Technical questions : 
 *                [{
 *                  question : "",
 *                  intention: "",
 *                  answer : "",
 *               }]
 *  - Behavioral questions : 
 *                [{
 *                  question : "",
 *                  intention: "",
 *                  answer : "",
 *               }]
 *  - Skill gaps : [{
 *                  skill : "",
 *                  severity : {
 *                    type: String,
 *                    enum : ["low", "medium", "high"]  
 *                  },
 *               }]
 *  - preparation plan : [{
 *                   day : Number,
 *                   focus : String,
 *                   task : [String]
 *                }]
 */

const technicalQuestionsSchema = new mongoose.Schema({
    question: {
        type : String,
        require: [true, "technical question is required"]
    },
    intention: {
        type: String,
        require: [true, "Intention is required"]
    },
    answer: {
        type: String,
        require: [true, "Answer is required"]
    }
},{
    _id: false
})

const behavioralQuestionsSchema = new mongoose.Schema({
    question: {
        type : String,
        require: [true, "behavioral question is required"]
    },
    intention: {
        type: String,
        require: [true, "Intention is required"]
    },
    answer: {
        type: String,
        require: [true, "Answer is required"]
    }
},{
    _id: false
})

const skillGapsSchema = new mongoose.Schema({
    skill: {
        type : String,
        require: [true, "skill is required"]
    },
    severity: {
        type: String,
        enum : ["low", "medium", "high"],
        require: [true, "severity is required"]
    }
},{
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        require: [true, "Day is required"]
    },
    focus: {
        type: String,
        required: [true, "Focus is required"]
    },
    tasks: [{
        type: String,
        required: [true, "Task is required"]
    }],
})

const interviewReportSchema = new mongoose.Schema({
    jobDescription : {
        type : String,
        required : [true, "job description is required"]
    },
    jobRole: {
        type: String
    },
    resume : {
        type : String,
    },
    selfDescription : {
        type : String,
    },
    matchScore : {
        type : Number,
        min : 0,
        max : 100
    },
    technicalQuestions : [technicalQuestionsSchema],
    behavioralQuestions : [behavioralQuestionsSchema],
    skillGaps : [skillGapsSchema],
    preparationPlan : [preparationPlanSchema],
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
},{
    timestamps: true 
})

const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = interviewReportModel;