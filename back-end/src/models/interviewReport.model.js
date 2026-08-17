const mongoose = require("mongoose");

const technicalQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "technical question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    _id: false
});

const behavioralQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "behavioral question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    _id: false
});

const skillGapsSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "skill is required"]
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true, "severity is required"]
    },
    recommendation: {
        type: String
    }
}, {
    _id: false
});

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"]
    },
    focus: {
        type: String,
        required: [true, "Focus is required"]
    },
    tasks: [{
        type: String,
        required: [true, "Task is required"]
    }]
}, {
    _id: false
});

const scoreBreakdownSchema = new mongoose.Schema({
    skillsScore: { type: Number, min: 0, max: 100, default: 0 },
    experienceScore: { type: Number, min: 0, max: 100, default: 0 },
    educationScore: { type: Number, min: 0, max: 100, default: 0 },
    responsibilitiesScore: { type: Number, min: 0, max: 100, default: 0 },
    atsFormattingScore: { type: Number, min: 0, max: 100, default: 0 }
}, {
    _id: false
});

const keywordItemSchema = new mongoose.Schema({
    keyword: { type: String, required: true },
    category: { type: String, default: "Skill" },
    priority: { type: String, enum: ["critical", "important", "nice-to-have"], default: "important" }
}, {
    _id: false
});

const parsedExperienceSchema = new mongoose.Schema({
    title: { type: String },
    company: { type: String },
    duration: { type: String },
    location: { type: String },
    highlights: [{ type: String }]
}, {
    _id: false
});

const parsedEducationSchema = new mongoose.Schema({
    degree: { type: String },
    institution: { type: String },
    year: { type: String },
    details: { type: String }
}, {
    _id: false
});

const parsedProjectSchema = new mongoose.Schema({
    name: { type: String },
    technologies: [{ type: String }],
    description: { type: String }
}, {
    _id: false
});

const parsedProfileSchema = new mongoose.Schema({
    fullName: { type: String },
    email: { type: String },
    phone: { type: String },
    location: { type: String },
    linkedin: { type: String },
    github: { type: String },
    summary: { type: String },
    hardSkills: [{ type: String }],
    softSkills: [{ type: String }],
    toolsAndFrameworks: [{ type: String }],
    experience: [parsedExperienceSchema],
    education: [parsedEducationSchema],
    projects: [parsedProjectSchema]
}, {
    _id: false
});

const bulletSuggestionSchema = new mongoose.Schema({
    original: { type: String },
    improved: { type: String },
    reason: { type: String }
}, {
    _id: false
});

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true, "job description is required"]
    },
    jobRole: {
        type: String
    },
    resume: {
        type: String
    },
    selfDescription: {
        type: String
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100
    },
    summaryAssessment: {
        type: String
    },
    scoreBreakdown: scoreBreakdownSchema,
    matchedKeywords: [keywordItemSchema],
    missingKeywords: [keywordItemSchema],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    bulletSuggestions: [bulletSuggestionSchema],
    parsedProfile: parsedProfileSchema,
    technicalQuestions: [technicalQuestionsSchema],
    behavioralQuestions: [behavioralQuestionsSchema],
    skillGaps: [skillGapsSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, {
    timestamps: true
});

const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = interviewReportModel;