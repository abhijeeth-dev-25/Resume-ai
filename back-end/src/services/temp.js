const resume = `
ABHIJEETH K
Kompalle, Hyderabad, India
Phone: +91 XXXXX XXXXX
Email: yourmail@email.com
LinkedIn: https://linkedin.com/in/yourprofile
GitHub: https://github.com/yourusername


PROFESSIONAL SUMMARY
Full Stack Developer skilled in building scalable web applications using JavaScript, Node.js, and React. Passionate about developing AI-powered tools, automation agents, and backend systems. Experienced in building REST APIs, integrating AI models, and deploying real-world developer products.


TECHNICAL SKILLS

Languages:
JavaScript, TypeScript, Python, C

Frontend:
React.js, Redux Toolkit, Tailwind CSS, HTML, CSS

Backend:
Node.js, Express.js, REST APIs, MVC Architecture

Database:
MongoDB, Mongoose

AI / ML:
Gemini API, OpenAI API, RAG Architecture, LangChain (basic)

Dev Tools:
Git, GitHub, Docker (basic), Postman, Linux


PROJECTS

AI Resume Builder
• Built an AI-powered resume generation system using Node.js and Gemini API.
• Implemented dynamic resume tailoring based on user input.
• Generated downloadable PDF resumes using Puppeteer.
• Stored structured user data in MongoDB.

Tech Stack: Node.js, Express.js, Gemini API, Puppeteer, MongoDB


RAG AI Chatbot
• Developed a Retrieval-Augmented Generation chatbot capable of answering domain-specific queries.
• Implemented document embedding and semantic search.
• Built backend APIs for chatbot interaction.

Tech Stack: Node.js, LangChain, Vector Database, AI APIs


Real-Time Chat Application
• Built a real-time messaging application using Socket.io.
• Implemented private messaging, group chat, and notifications.
• Designed scalable backend event architecture.

Tech Stack: Node.js, Express.js, Socket.io, MongoDB


System Automation Agent
• Built an AI agent capable of automating browser tasks.
• Implemented website login automation and task execution using Puppeteer.
• Integrated natural language commands for automation workflows.

Tech Stack: Node.js, Puppeteer, AI APIs


WORK EXPERIENCE

Backend Developer
TechNova Solutions
Jan 2023 – Present

• Designed and developed REST APIs serving thousands of users.
• Optimized MongoDB queries using indexing and aggregation pipelines.
• Implemented authentication and authorization using JWT.
• Integrated Redis caching to improve API performance.
• Migrated backend architecture from monolithic to modular services.


EDUCATION

Bachelor of Technology in Computer Science
University Name
Year – Year


ACHIEVEMENTS

• Built multiple AI-powered developer tools and automation systems.
• Active contributor on GitHub with several backend and AI projects.
• Passionate about building scalable software products.


OPEN SOURCE / DEV PROJECTS

C-Pulse VS Code Extension
• Built a VS Code extension for monitoring and analyzing C program execution inside the editor. 
`

const selfDescription = `
PROFESSIONAL SUMMARY

Motivated Full Stack Developer with strong knowledge of modern web technologies including JavaScript, Node.js, React.js, and MongoDB. Passionate about building scalable web applications, AI-powered tools, and backend systems. Experienced in developing RESTful APIs, real-time applications, and automation solutions.

Skilled in integrating AI services such as Gemini API and building intelligent applications like AI chatbots, automation agents, and resume generation tools. Strong understanding of backend architecture, database design, and performance optimization.

A continuous learner who enjoys solving real-world problems through technology and building innovative software products that improve user experience and system efficiency.
`

const jobDescription = `
Role: Senior AI Integration Engineer

Location: Hyderabad, India

We are looking for a senior ai integration engineer who can integrate ai models into our core product.

Responsibilities:
- Design, develop, and maintain robust backend services using Node.js.
- Integrate cutting-edge AI models (Google Gemini, OpenAI) into our core product.
- Collaborate with frontend engineers to build seamless user experiences.
- Optimize application performance and ensure scalability in cloud environments (AWS/GCP).
- Write comprehensive unit and integration tests.

Requirements:
- 5+ years of experience in software development.
- Strong proficiency in JavaScript/Node.js and backend frameworks like Express.
- Experience with AI API integrations and prompt engineering is a big plus.
- Solid understanding of database design (NoSQL, specifically MongoDB).
- Excellent problem-solving and communication skills.

Preferred Skills:
- Experience with cloud platforms like AWS/GCP.
- Experience with containerization technologies like Docker.
- Experience with CI/CD pipelines.
- Experience with monitoring and logging tools.
`

module.exports = {
    resume,
    selfDescription,
    jobDescription
};


