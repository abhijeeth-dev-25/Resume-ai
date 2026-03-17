import api from './api';

export const interviewService = {
    /**
     * Submit resume + job description + self description to generate AI interview report.
     * @param {{ resume: File, jobDescription: string, selfDescription: string }} data
     */
    submitInterview: async ({ resume, jobDescription, selfDescription }) => {
        const formData = new FormData();
        formData.append('resume', resume);
        formData.append('jobDescription', jobDescription);
        formData.append('selfDescription', selfDescription);

        const response = await api.post('/interview/', formData);
        return response.data;
    },

    /**
     * Get user's previously generated reports
     */
    getMyReports: async () => {
        const response = await api.get('/interview/my-reports');
        return response.data;
    },

    /**
     * Download the AI-generated resume PDF
     * @param {string} interviewReportId
     */
    downloadResume: async (interviewReportId) => {
        const response = await api.post(`/interview/resume/pdf/${interviewReportId}`, {}, {
            responseType: 'blob'
        });
        return response.data;
    }
};
