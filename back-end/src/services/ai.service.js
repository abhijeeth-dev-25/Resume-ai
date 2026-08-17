require("dotenv").config();
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { StateGraph, START, END, Annotation } = require("@langchain/langgraph");
const { z } = require("zod");
const puppeteer = require("puppeteer");

// ── Initialize LLM Instance ──────────────────────────────────────────────────
function getModel() {
    const apiKey = process.env.GOOGLE_GEN_AI_API_KEY || process.env.GOOGLE_API_KEY;
    return new ChatGoogleGenerativeAI({
        apiKey: apiKey || "dummy-key-for-initialization",
        model: "gemini-2.5-flash",
        temperature: 0.15,
    });
}

// ── Zod Schemas for Structured Node Outputs ───────────────────────────────────

const parsedProfileSchema = z.object({
    fullName: z.string().describe("Candidate full name"),
    email: z.string().optional().describe("Email address if found"),
    phone: z.string().optional().describe("Phone number if found"),
    location: z.string().optional().describe("City, Country or Remote status"),
    linkedin: z.string().optional().describe("LinkedIn profile URL or handle"),
    github: z.string().optional().describe("GitHub, Portfolio, or personal site"),
    summary: z.string().describe("Professional summary / bio"),
    hardSkills: z.array(z.string()).describe("Core technical and hard skills"),
    softSkills: z.array(z.string()).describe("Soft skills and leadership competencies"),
    toolsAndFrameworks: z.array(z.string()).describe("Frameworks, databases, cloud, and tools"),
    experience: z.array(z.object({
        title: z.string().describe("Job title"),
        company: z.string().describe("Company or organization"),
        duration: z.string().describe("Dates / tenure"),
        location: z.string().optional().describe("Location"),
        highlights: z.array(z.string()).describe("Key accomplishments & responsibilities")
    })).describe("Work experience history"),
    education: z.array(z.object({
        degree: z.string().describe("Degree / Certification"),
        institution: z.string().describe("University or Institute"),
        year: z.string().describe("Graduation year or date range"),
        details: z.string().optional().describe("GPA, honors, or coursework")
    })).describe("Education history"),
    projects: z.array(z.object({
        name: z.string().describe("Project name"),
        technologies: z.array(z.string()).describe("Technologies used"),
        description: z.string().describe("Project description and measurable impact")
    })).optional().describe("Notable projects")
});

const atsMatchSchema = z.object({
    jobRole: z.string().describe("Primary job role title extracted from the JD"),
    matchScore: z.number().min(0).max(100).describe("Overall ATS match score (0-100)"),
    summaryAssessment: z.string().describe("Executive hiring manager assessment summary"),
    scoreBreakdown: z.object({
        skillsScore: z.number().min(0).max(100).describe("Technical & hard skills match"),
        experienceScore: z.number().min(0).max(100).describe("Experience & seniority match"),
        educationScore: z.number().min(0).max(100).describe("Education & credentials match"),
        responsibilitiesScore: z.number().min(0).max(100).describe("Day-to-day deliverables match"),
        atsFormattingScore: z.number().min(0).max(100).describe("ATS readability & quantified impact")
    }),
    matchedKeywords: z.array(z.object({
        keyword: z.string().describe("Matched skill/keyword found in both resume and JD"),
        category: z.string().describe("Category: Frontend, Backend, Cloud, Tool, etc."),
        priority: z.enum(["critical", "important", "nice-to-have"]).describe("Importance in JD")
    })),
    missingKeywords: z.array(z.object({
        keyword: z.string().describe("Critical keyword requested in JD but missing from resume"),
        category: z.string().describe("Category: Cloud, Architecture, Tool, etc."),
        priority: z.enum(["critical", "important", "nice-to-have"]).describe("Importance in JD")
    })),
    strengths: z.array(z.string()).describe("3-5 competitive strengths for this role"),
    weaknesses: z.array(z.string()).describe("2-4 potential risks or gap areas interviewers will probe"),
    bulletSuggestions: z.array(z.object({
        original: z.string().describe("Weak or generic resume bullet point"),
        improved: z.string().describe("Impactful STAR rewrite with action verbs and metrics"),
        reason: z.string().describe("Why this rewrite is superior")
    })).describe("Resume bullet point rewrite suggestions")
});

const interviewQuestionsSchema = z.object({
    technicalQuestions: z.array(z.object({
        question: z.string().describe("Challenging technical interview question"),
        intention: z.string().describe("What the interviewer is specifically evaluating"),
        answer: z.string().describe("Detailed high-scoring response framework with key concepts")
    })),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("Behavioral/situational interview question"),
        intention: z.string().describe("Why this behavior is critical for the target role"),
        answer: z.string().describe("Structured STAR method response guide")
    }))
});

const remediationRoadmapSchema = z.object({
    skillGaps: z.array(z.object({
        skill: z.string().describe("Missing or under-emphasized skill"),
        severity: z.enum(["low", "medium", "high"]).describe("Severity of the gap"),
        recommendation: z.string().describe("Actionable advice to bridge or articulate this gap")
    })),
    preparationPlan: z.array(z.object({
        day: z.number().describe("Day number (e.g. 1, 2, 3...)"),
        focus: z.string().describe("Primary domain/topic focus"),
        tasks: z.array(z.string()).describe("Actionable daily study and practice tasks")
    }))
});

// ── LangGraph State Annotation ────────────────────────────────────────────────
const GraphState = Annotation.Root({
    resume: Annotation(),
    jobDescription: Annotation(),
    selfDescription: Annotation(),
    parsedProfile: Annotation(),
    jobRole: Annotation(),
    matchScore: Annotation(),
    summaryAssessment: Annotation(),
    scoreBreakdown: Annotation(),
    matchedKeywords: Annotation(),
    missingKeywords: Annotation(),
    strengths: Annotation(),
    weaknesses: Annotation(),
    bulletSuggestions: Annotation(),
    technicalQuestions: Annotation(),
    behavioralQuestions: Annotation(),
    skillGaps: Annotation(),
    preparationPlan: Annotation(),
});

// ── LangGraph Nodes ───────────────────────────────────────────────────────────

/**
 * Node 1: Extract candidate profile, skills inventory, timeline, and education from resume text
 */
async function parseResumeNode(state) {
    const model = getModel();
    const structuredModel = model.withStructuredOutput(parsedProfileSchema);
    const prompt = `You are a Principal Technical Recruiter and ATS Parser.
Extract the candidate's complete profile from this resume into clean structured data.

Resume:
"""
${state.resume}
"""`;

    const parsedProfile = await structuredModel.invoke(prompt);
    return { parsedProfile };
}

/**
 * Node 2: Compare candidate profile against Target Job Description and compute ATS metrics
 */
async function compareAndScoreNode(state) {
    const model = getModel();
    const structuredModel = model.withStructuredOutput(atsMatchSchema);
    const prompt = `You are a Senior Technical Hiring Manager and Talent Assessment Specialist.
Compare this candidate's parsed profile and background against the Target Job Description.
Perform rigorous ATS comparison scoring, keyword overlap analysis, competitive advantages, risks, and bullet point rewrites.

Target Job Description:
"""
${state.jobDescription}
"""

Candidate Profile:
${JSON.stringify(state.parsedProfile, null, 2)}

Candidate Self Description / Career Goals:
"""
${state.selfDescription || "Not provided"}
"""`;

    const matchAnalysis = await structuredModel.invoke(prompt);
    return {
        jobRole: matchAnalysis.jobRole,
        matchScore: matchAnalysis.matchScore,
        summaryAssessment: matchAnalysis.summaryAssessment,
        scoreBreakdown: matchAnalysis.scoreBreakdown,
        matchedKeywords: matchAnalysis.matchedKeywords,
        missingKeywords: matchAnalysis.missingKeywords,
        strengths: matchAnalysis.strengths,
        weaknesses: matchAnalysis.weaknesses,
        bulletSuggestions: matchAnalysis.bulletSuggestions,
    };
}

/**
 * Node 3: Generate custom technical and behavioral interview questions tailored to verified skills & gaps
 */
async function generateQuestionsNode(state) {
    const model = getModel();
    const structuredModel = model.withStructuredOutput(interviewQuestionsSchema);
    const prompt = `You are a Principal Interviewer at a Tier-1 Tech Company.
Generate tailored technical and behavioral questions specifically to evaluate this candidate for the role of "${state.jobRole}".
Design technical questions to probe domain depth and gaps against the JD, and behavioral questions structured for the STAR technique.

Job Description:
"""
${state.jobDescription}
"""

Matched Skills: ${state.matchedKeywords?.map(k => k.keyword).join(", ")}
Missing Critical Areas: ${state.missingKeywords?.map(k => k.keyword).join(", ")}`;

    const questions = await structuredModel.invoke(prompt);
    return {
        technicalQuestions: questions.technicalQuestions,
        behavioralQuestions: questions.behavioralQuestions,
    };
}

/**
 * Node 4: Formulate skill remediation guidance and a structured day-by-day roadmap
 */
async function generateRoadmapNode(state) {
    const model = getModel();
    const structuredModel = model.withStructuredOutput(remediationRoadmapSchema);
    const prompt = `You are an Executive Career & Interview Coach.
Formulate a skill gap remediation matrix and a 5-7 day structured preparation roadmap to help the candidate excel in the interview for "${state.jobRole}".

Job Description:
"""
${state.jobDescription}
"""

Missing / Weak Skills: ${state.missingKeywords?.map(k => k.keyword).join(", ")}
Identified Weaknesses: ${state.weaknesses?.join("; ")}`;

    const roadmap = await structuredModel.invoke(prompt);
    return {
        skillGaps: roadmap.skillGaps,
        preparationPlan: roadmap.preparationPlan,
    };
}

// ── Compile LangGraph Graph ───────────────────────────────────────────────────
const workflow = new StateGraph(GraphState)
    .addNode("parseResume", parseResumeNode)
    .addNode("compareAndScore", compareAndScoreNode)
    .addNode("generateQuestions", generateQuestionsNode)
    .addNode("generateRoadmap", generateRoadmapNode)
    .addEdge(START, "parseResume")
    .addEdge("parseResume", "compareAndScore")
    .addEdge("compareAndScore", "generateQuestions")
    .addEdge("generateQuestions", "generateRoadmap")
    .addEdge("generateRoadmap", END);

const interviewGraph = workflow.compile();

// ── Main Service Functions ────────────────────────────────────────────────────

/**
 * Execute the multi-agent LangGraph workflow to generate an enterprise ATS interview report
 */
async function generateInterviewReport({ resume, jobDescription, selfDescription }) {
    try {
        const finalState = await interviewGraph.invoke({
            resume,
            jobDescription,
            selfDescription: selfDescription || "",
        });

        return {
            jobRole: finalState.jobRole,
            matchScore: finalState.matchScore,
            summaryAssessment: finalState.summaryAssessment,
            scoreBreakdown: finalState.scoreBreakdown,
            matchedKeywords: finalState.matchedKeywords,
            missingKeywords: finalState.missingKeywords,
            strengths: finalState.strengths,
            weaknesses: finalState.weaknesses,
            bulletSuggestions: finalState.bulletSuggestions,
            parsedProfile: finalState.parsedProfile,
            technicalQuestions: finalState.technicalQuestions,
            behavioralQuestions: finalState.behavioralQuestions,
            skillGaps: finalState.skillGaps,
            preparationPlan: finalState.preparationPlan,
        };

    } catch (error) {
        console.error("LangGraph interview report generation error:", error);
        throw error;
    }
}

/**
 * Generate PDF buffer using Puppeteer
 */
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "15mm",
            bottom: "15mm",
            left: "15mm",
            right: "15mm"
        },
        printBackground: true
    });

    await browser.close();
    return pdfBuffer;
}

/**
 * Generate tailored ATS-friendly resume PDF via LangChain structured output
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("Clean, modern, ATS-compliant HTML/CSS resume ready for Puppeteer rendering to A4 PDF")
    });

    const model = getModel();
    const structuredModel = model.withStructuredOutput(resumePdfSchema);
    const prompt = `You are a Professional Executive Resume Writer. Create a high-converting, ATS-friendly, tailored 1-2 page resume HTML document.
Candidate Information:
Resume Text:
"""
${resume}
"""

Candidate Background / Notes:
"""
${selfDescription}
"""

Target Job:
"""
${jobDescription}
"""

Requirements:
1. Design: Modern, clean typography with embedded Google Fonts (e.g. Inter/Outfit), subtle divider lines, high readability.
2. Styling: Inline CSS with A4-compatible sizing (#1A1A1A body, #D97706 or #2563EB accent colors).
3. Content: Human-written tone, strong action verbs, quantifiable achievements, tailored keywords naturally woven into experience and skills.`;

    const response = await structuredModel.invoke(prompt);
    const pdfBuffer = await generatePdfFromHtml(response.html);
    return pdfBuffer;
}

module.exports = {
    generateInterviewReport,
    generateResumePdf,
    interviewGraph
};