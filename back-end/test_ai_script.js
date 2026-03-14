require('dotenv').config({ path: '/Users/abhijeethkar/Desktop/AI/back-end/.env' });
const { resume, selfDescription, jobDescription } = require('/Users/abhijeethkar/Desktop/AI/back-end/src/services/temp');
const { generateInterviewReport } = require('/Users/abhijeethkar/Desktop/AI/back-end/src/services/ai.service');

// generateInterviewReport(resume, jobDescription, selfDescription).then(
//     () => process.exit(0)
// ).catch(err => {
//     console.error(err);
//     process.exit(1);
// });
