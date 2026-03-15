const pdfParse = require("pdf-parse");
const { generateInterviewReport } = require("../services/ai.service");
const InterviewReport = require("../models/interviewReport.model");

async function generateInterViewReportController(req, res) {
    try {
        const resumeFile = req.file;

        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
        console.log(resumeContent);
        const { selfDescription, jobDescription } = req.body;

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        })

        if (interViewReportByAi.skillGaps && Array.isArray(interViewReportByAi.skillGaps)) {
            interViewReportByAi.skillGaps = interViewReportByAi.skillGaps.map(gap => {
                let severityStr = String(gap.severity || "low").toLowerCase();
                let normalizedSeverity = "low";
                if (severityStr.includes("high")) normalizedSeverity = "high";
                else if (severityStr.includes("medium")) normalizedSeverity = "medium";

                gap.severity = normalizedSeverity;
                return gap;
            });
        }

        const interviewReport = await InterviewReport.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            success: true,
            message: "Interview report generated successfully",
            report: {
                jobRole:              interviewReport.jobRole,
                matchScore:           interviewReport.matchScore,
                technicalQuestions:   interviewReport.technicalQuestions,
                behavioralQuestions:  interviewReport.behavioralQuestions,
                skillGaps:            interviewReport.skillGaps,
                preparationPlan:      interviewReport.preparationPlan,
            }
        })



    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to generate interview report",
            error: error.message
        })
    }
}

async function getMyReportsController(req, res) {
    try {
        const reports = await InterviewReport.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch reports",
            error: error.message
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getMyReportsController
}