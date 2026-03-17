const pdfParse = require("pdf-parse");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");
const { generateResumePdf } = require("../services/ai.service");


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

        const interviewReport = await interviewReportModel.create({
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
                _id:                  interviewReport._id,
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
        const reports = await interviewReportModel.find({ user: req.user.id })
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

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}



module.exports = {
    generateInterViewReportController,
    getMyReportsController,
    getAllInterviewReportsController,
    generateResumePdfController
}