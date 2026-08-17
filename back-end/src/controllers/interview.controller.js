const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @name generateInterViewReportController
 * @description Parse PDF resume, extract text, call Gemini for enterprise ATS report, and save to DB.
 * @access Private
 */
async function generateInterViewReportController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload your resume PDF file."
            });
        }

        const { selfDescription, jobDescription } = req.body;
        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                success: false,
                message: "Job description is required."
            });
        }

        const pdfData = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
        const resumeText = pdfData.text || "";

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescription.trim()
        });

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
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        return res.status(201).json({
            success: true,
            message: "Interview report generated successfully",
            report: interviewReport
        });

    } catch (error) {
        console.error("generateInterViewReportController error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate interview report",
            error: error.message
        });
    }
}

/**
 * @name getMyReportsController
 * @description Get all past interview reports for the logged in user
 * @access Private
 */
async function getMyReportsController(req, res) {
    try {
        const reports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            reports
        });
    } catch (error) {
        console.error("getMyReportsController error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reports",
            error: error.message
        });
    }
}

/**
 * @name getAllInterviewReportsController
 * @description Controller to get all interview reports summary of logged in user
 * @access Private
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v");

        return res.status(200).json({
            success: true,
            message: "Interview reports fetched successfully.",
            interviewReports
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch interview reports.",
            error: error.message
        });
    }
}

/**
 * @name generateResumePdfController
 * @description Generate tailored resume PDF based on user self description, resume and job description.
 * @access Private
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        });

        return res.send(pdfBuffer);

    } catch (error) {
        console.error("generateResumePdfController error:", error);
        return res.status(500).json({
            message: "Failed to generate resume PDF",
            error: error.message
        });
    }
}

/**
 * @name generatePrepGuidePdfController
 * @description Generate Master Interview Preparation Guide PDF based on interview report.
 * @access Private
 */
async function generatePrepGuidePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const pdfBuffer = await generatePrepGuidePdf({ report: interviewReport });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=prep_guide_${interviewReportId}.pdf`
        });

        return res.send(pdfBuffer);

    } catch (error) {
        console.error("generatePrepGuidePdfController error:", error);
        return res.status(500).json({
            message: "Failed to generate preparation guide PDF",
            error: error.message
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getMyReportsController,
    getAllInterviewReportsController,
    generateResumePdfController,
    generatePrepGuidePdfController
};