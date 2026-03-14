const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEN_AI_API_KEY });

const interviewReportSchema = {
    type: Type.OBJECT,
    properties: {
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
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
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

module.exports = { generateInterviewReport }