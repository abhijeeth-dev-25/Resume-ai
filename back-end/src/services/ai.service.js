const { GoogleGenAI, Type } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");


const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEN_AI_API_KEY });

const interviewReportSchema = {
    type: Type.OBJECT,
    properties: {
        jobRole: {
            type: Type.STRING,
            description: "The primary job title or role mentioned in the job description (e.g., 'Senior Frontend Developer', 'Backend Engineer')"
        },
        matchScore: {
            type: Type.NUMBER,
            description: "A score between 0 to 100 indicating how well the candidate's resume matches the job description"
        },
        technicalQuestions: {
            type: Type.ARRAY,
            description: "Technical Questions that can be asked in the interview based on the resume and job description",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The technical question can be as asked in the interview" },
                    intention: { type: Type.STRING, description: "The intention of interviewer behind asking this question" },
                    answer: { type: Type.STRING, description: "How to answer this question, What points to cover, what approach to take, what to avoid, what to highlight" }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: Type.ARRAY,
            description: "Behavioral Questions that can be asked in the interview based on the resume and job description",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The behavioral question can be as asked in the interview" },
                    intention: { type: Type.STRING, description: "The intention of interviewer behind asking this question" },
                    answer: { type: Type.STRING, description: "How to answer this question, What points to cover, what approach to take, what to avoid, what to highlight" }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: Type.ARRAY,
            description: "Skill gaps that can be identified in the resume based on the job description",
            items: {
                type: Type.OBJECT,
                properties: {
                    skill: { type: Type.STRING, description: "The skill that is missing in the resume" },
                    severity: {
                        type: Type.STRING,
                        description: "The severity of the skill gap. Must be EXACTLY ONE OF: 'low', 'medium', 'high'",
                        enum: ["low", "medium", "high"]
                    }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: Type.ARRAY,
            description: "Preparation plan for the topics that need to be prepared",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER, description: "The day of the preparation plan" },
                    focus: { type: Type.STRING, description: "The focus of the preparation plan" },
                    tasks: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "The tasks that need to be done on the day"
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },
    required: ["jobRole", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
};

async function generateInterviewReport({ resume, jobDescription, selfDescription }) {
    const prompt = ` Generate an interview report based on the following resume and job description:
                     Resume: ${resume}
                     Job Description: ${jobDescription}
                     Self Description: ${selfDescription}
                     `;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewReportSchema,
                temperature: 0.2,
            },
        });

        // FIXED: Used result.text instead of result.response.text()
        console.log(result.text);
        return JSON.parse(result.text);

    } catch (error) {
        console.error("Failed to generate report:", error);
        throw error;
    }
}


async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}



module.exports = { generateInterviewReport, generateResumePdf }