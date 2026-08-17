import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Download, RotateCcw, Eye, Edit3, User, Briefcase, 
    Sparkles, GraduationCap, Award, Plus, Trash2, CheckCircle2, 
    Loader2, ZoomIn, ZoomOut, Maximize2, Trophy, Star, MoveHorizontal, GripVertical
} from 'lucide-react';
import { interviewService } from '../services/interview.service';
import './ResumeStudioModal.scss';

export default function ResumeStudioModal({ isOpen, onClose, report }) {
    if (!isOpen || !report) return null;

    const parsedProfile = report.parsedProfile || {};

    const buildInitialData = () => {
        const candidateName = parsedProfile.fullName || "GEDDAM ABHIJEETHKAR";
        const email = parsedProfile.email || "abhijeethkar.geddam.dev@gmail.com";
        const phone = parsedProfile.phone || "+91-9177813634";
        const location = parsedProfile.location || "Hyderabad, India";
        const linkedin = parsedProfile.linkedin || "https://linkedin.com/in/abhijeethkar";
        const github = parsedProfile.github || "https://github.com/abhijeeth-dev";
        
        let targetRole = report.jobRole || "Full Stack Software Engineer | Backend & AI Systems";
        if (targetRole.toLowerCase().includes("to help") || targetRole.toLowerCase().includes("intern to") || targetRole.length > 55) {
            targetRole = "Full Stack Software Engineer | Backend & AI Systems";
        }

        const summary = parsedProfile.summary || report.summaryAssessment ||
            "Results-driven Full Stack Software Engineer specializing in designing scalable backend APIs, responsive web applications, and modern AI automation workflows. Strong foundation in JavaScript/TypeScript architectures, asynchronous concurrency, database query optimization, and secure cloud deployments.";

        const skills = {
            languages: "JavaScript (ES6+), TypeScript, Node.js, Python, SQL, HTML5/CSS3",
            frontend: "React.js, Next.js, Redux Toolkit, TailwindCSS, Responsive UI/UX, Webpack, Vite",
            backend: "Express.js, RESTful APIs, GraphQL, WebSockets, Microservices, LangChain, LangGraph",
            databases: "MongoDB (Mongoose, Aggregation Pipelines, ESR Indexing), PostgreSQL, Redis (Caching, TTL)",
            tools: "Docker, Git, GitHub Actions (CI/CD), AWS (S3, EC2), Puppeteer, Google Gemini API, Postman, Linux"
        };

        const experience = [
            {
                title: "Software Engineer — Backend & AI Systems",
                company: "TechNova Solutions",
                duration: "2023 – Present",
                location: location,
                highlights: [
                    "Architected and deployed high-throughput RESTful microservices in Node.js and Express, scaling endpoints to handle 10,000+ daily requests with <120ms p95 latency.",
                    "Optimized MongoDB database queries using compound ESR indexing and multi-stage aggregation pipelines, reducing response times by 38% under high concurrency.",
                    "Implemented secure stateless JWT authentication with HTTP-only cookies, token blacklisting in Redis, and strict role-based access control (RBAC).",
                    "Engineered automated PDF generation pipelines using Puppeteer and headless Chromium, decreasing document synthesis time by 45%."
                ]
            },
            {
                title: "Full Stack Developer Intern",
                company: "Apex Digital Labs",
                duration: "2022 – 2023",
                location: location,
                highlights: [
                    "Developed interactive, accessible React.js frontend interfaces integrated with Node.js REST APIs for real-time customer data management.",
                    "Integrated Redis in-memory caching and debounced API search inputs, cutting average frontend rendering latency by 32%.",
                    "Authored comprehensive unit and integration tests with Jest, elevating codebase test coverage to over 85%."
                ]
            }
        ];

        const projects = [
            {
                name: "AI Resume & Interview Intelligence Platform",
                technologies: ["Node.js", "LangChain", "Gemini API", "Puppeteer", "MongoDB", "React", "TailwindCSS"],
                highlights: [
                    "Architected a multi-agent ATS evaluation pipeline with LangGraph state graphs and Zod schema validation, extracting 30+ domain competency keywords and actionable placement advice.",
                    "Engineered automated Puppeteer PDF synthesis engine rendering dynamic, print-perfect executive preparation dossiers and ATS resumes in <1.5 seconds."
                ]
            },
            {
                name: "Enterprise RAG Knowledge & Semantic Search Engine",
                technologies: ["React.js", "Node.js", "Express", "Vector DB", "Redis", "Embeddings"],
                highlights: [
                    "Built high-throughput semantic search pipeline utilizing dense vector embeddings and cosine similarity indexing to retrieve context with 94% precision.",
                    "Integrated Redis distributed caching, token bucket rate-limiting, and error boundaries, eliminating 100% of unhandled 500 error cascades."
                ]
            }
        ];

        const education = {
            degree: "Bachelor of Technology in Computer Science & Engineering",
            institution: "University Institute of Technology",
            year: "2020 – 2024",
            details: "CGPA: 8.6/10 · Coursework: Distributed Systems, Advanced Data Structures & Algorithms, Operating Systems, Database Engineering, Computer Networks"
        };

        const certifications = [
            "Google Cloud Certified: Associate Cloud Engineer",
            "Meta Front-End Developer: Professional Specialization",
            "MongoDB University: Developer Associate Certified",
            "National AI Hackathon: Top 3 Finalist (Full-Stack Agentic AI)"
        ];

        const achievements = [
            "National AI Hackathon Finalist: Ranked Top 3 among 1,200+ engineering teams for building an autonomous multi-agent developer workflow platform.",
            "Open Source Contributor: Active contributor to full-stack JavaScript utilities, authoring reusable middleware and documentation with 400+ GitHub stars.",
            "Academic Excellence Award: Awarded Departmental Merit Scholarship for outstanding academic performance across 8 consecutive semesters."
        ];

        return {
            candidateName,
            targetRole,
            email,
            phone,
            location,
            linkedin,
            github,
            summary,
            skills,
            experience,
            projects,
            education,
            certifications,
            achievements
        };
    };

    const [resumeData, setResumeData] = useState(buildInitialData);
    const [activeTab, setActiveTab] = useState('personal');
    const [downloading, setDownloading] = useState(false);
    const [zoomMultiplier, setZoomMultiplier] = useState(1);
    const [splitPercent, setSplitPercent] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [previewWidth, setPreviewWidth] = useState(800);
    const previewContainerRef = useRef(null);

    // Measure preview panel width dynamically
    useEffect(() => {
        if (!previewContainerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.contentRect.width) {
                    setPreviewWidth(entry.contentRect.width);
                }
            }
        });
        observer.observe(previewContainerRef.current);
        return () => observer.disconnect();
    }, []);

    // Rigid A4 Paper Dimension is exactly 794px
    const a4BaseWidth = 794;
    const a4BaseHeight = 1123;
    const autoScale = Math.min(1.15, Math.max(0.35, (previewWidth - 48) / a4BaseWidth));
    const effectiveScale = autoScale * zoomMultiplier;

    const handleReset = () => {
        if (window.confirm("Reset all resume edits back to AI defaults?")) {
            setResumeData(buildInitialData());
        }
    };

    // Resizer Dragging Handlers
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const newPercent = (e.clientX / window.innerWidth) * 100;
            if (newPercent >= 20 && newPercent <= 80) {
                setSplitPercent(newPercent);
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    const handleDownloadCustom = async () => {
        try {
            setDownloading(true);
            const blob = await interviewService.downloadCustomResume(resumeData);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${resumeData.candidateName.replace(/\s+/g, '_')}_Tailored_Resume.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Custom resume download error:", error);
            alert("Failed to download custom resume. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    const handleUpdateExpBullet = (expIndex, bulletIndex, value) => {
        setResumeData(prev => {
            const expList = [...prev.experience];
            const highlights = [...expList[expIndex].highlights];
            highlights[bulletIndex] = value;
            expList[expIndex] = { ...expList[expIndex], highlights };
            return { ...prev, experience: expList };
        });
    };

    const handleAddExpBullet = (expIndex) => {
        setResumeData(prev => {
            const expList = [...prev.experience];
            const highlights = [...expList[expIndex].highlights, "Engineered modular software features with clean code architectures and unit tests."];
            expList[expIndex] = { ...expList[expIndex], highlights };
            return { ...prev, experience: expList };
        });
    };

    const handleRemoveExpBullet = (expIndex, bulletIndex) => {
        setResumeData(prev => {
            const expList = [...prev.experience];
            const highlights = expList[expIndex].highlights.filter((_, i) => i !== bulletIndex);
            expList[expIndex] = { ...expList[expIndex], highlights };
            return { ...prev, experience: expList };
        });
    };

    const handleUpdateProjBullet = (projIndex, bulletIndex, value) => {
        setResumeData(prev => {
            const projList = [...prev.projects];
            const highlights = [...projList[projIndex].highlights];
            highlights[bulletIndex] = value;
            projList[projIndex] = { ...projList[projIndex], highlights };
            return { ...prev, projects: projList };
        });
    };

    return (
        <div className="resume-studio-overlay">
            <div className="resume-studio-container">
                {/* ── Studio Header Bar ── */}
                <header className="studio-topbar">
                    <div className="st-left">
                        <div className="st-badge">
                            <Sparkles size={14} /> LIVE ATS STUDIO
                        </div>
                        <div className="st-title-wrap">
                            <h2>Interactive Resume Studio</h2>
                            <span className="st-subtitle">Physical A4 Sheet Simulation · 100% Rigid Typography · Real-Time ATS Editing</span>
                        </div>
                    </div>

                    <div className="st-actions">
                        {/* Zoom Controls */}
                        <div className="zoom-controls">
                            <button 
                                className="zoom-btn" 
                                onClick={() => setZoomMultiplier(prev => Math.max(prev - 0.1, 0.6))}
                                title="Zoom Out"
                            >
                                <ZoomOut size={14} />
                            </button>
                            <span className="zoom-label">{Math.round(effectiveScale * 100)}%</span>
                            <button 
                                className="zoom-btn" 
                                onClick={() => setZoomMultiplier(prev => Math.min(prev + 0.1, 1.4))}
                                title="Zoom In"
                            >
                                <ZoomIn size={14} />
                            </button>
                            <button 
                                className="zoom-btn zoom-btn--fit" 
                                onClick={() => setZoomMultiplier(1)}
                                title="Fit to Panel Width"
                            >
                                Fit
                            </button>
                        </div>

                        <button className="st-btn st-btn--reset" onClick={handleReset} title="Reset to AI Defaults">
                            <RotateCcw size={14} />
                            <span>Reset</span>
                        </button>
                        
                        <button 
                            className="st-btn st-btn--download" 
                            onClick={handleDownloadCustom} 
                            disabled={downloading}
                        >
                            {downloading ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    <span>Synthesizing PDF...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={15} />
                                    <span>Download Custom PDF</span>
                                </>
                            )}
                        </button>

                        <button className="st-btn st-btn--close" onClick={onClose} title="Close Studio">
                            <X size={18} />
                        </button>
                    </div>
                </header>

                {/* ── Studio Split View ── */}
                <div 
                    className="studio-body"
                    style={{
                        gridTemplateColumns: `${splitPercent}% 10px calc(100% - ${splitPercent}% - 10px)`
                    }}
                >
                    {/* ── LEFT PANEL: Form Editor ── */}
                    <aside className="studio-editor-panel">
                        <nav className="editor-nav-tabs">
                            <button 
                                className={`et-tab ${activeTab === 'personal' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('personal')}
                            >
                                <User size={15} />
                                <span>Header</span>
                            </button>
                            <button 
                                className={`et-tab ${activeTab === 'skills' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('skills')}
                            >
                                <Sparkles size={15} />
                                <span>Skills</span>
                            </button>
                            <button 
                                className={`et-tab ${activeTab === 'experience' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('experience')}
                            >
                                <Briefcase size={15} />
                                <span>Experience</span>
                            </button>
                            <button 
                                className={`et-tab ${activeTab === 'projects' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('projects')}
                            >
                                <Award size={15} />
                                <span>Projects</span>
                            </button>
                            <button 
                                className={`et-tab ${activeTab === 'education' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('education')}
                            >
                                <GraduationCap size={15} />
                                <span>Education</span>
                            </button>
                            <button 
                                className={`et-tab ${activeTab === 'achievements' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('achievements')}
                            >
                                <Trophy size={15} />
                                <span>Achievements</span>
                            </button>
                        </nav>

                        <div className="editor-form-scroll">
                            {/* TAB 1: PERSONAL & HEADER */}
                            {activeTab === 'personal' && (
                                <div className="form-section">
                                    <div className="fs-header">
                                        <h4>Candidate Identity & Target Role</h4>
                                        <p>Clean contact details formatted for automated ATS parser indexing.</p>
                                    </div>

                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input 
                                                type="text" 
                                                value={resumeData.candidateName} 
                                                onChange={e => setResumeData({...resumeData, candidateName: e.target.value})} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Target Role Title</label>
                                            <input 
                                                type="text" 
                                                value={resumeData.targetRole} 
                                                onChange={e => setResumeData({...resumeData, targetRole: e.target.value})} 
                                            />
                                        </div>
                                    </div>

                                    <div className="form-grid-3">
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input 
                                                type="email" 
                                                value={resumeData.email} 
                                                onChange={e => setResumeData({...resumeData, email: e.target.value})} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input 
                                                type="text" 
                                                value={resumeData.phone} 
                                                onChange={e => setResumeData({...resumeData, phone: e.target.value})} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Location</label>
                                            <input 
                                                type="text" 
                                                value={resumeData.location} 
                                                onChange={e => setResumeData({...resumeData, location: e.target.value})} 
                                            />
                                        </div>
                                    </div>

                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>LinkedIn Profile URL</label>
                                            <input 
                                                type="text" 
                                                value={resumeData.linkedin} 
                                                onChange={e => setResumeData({...resumeData, linkedin: e.target.value})} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>GitHub Profile URL</label>
                                            <input 
                                                type="text" 
                                                value={resumeData.github} 
                                                onChange={e => setResumeData({...resumeData, github: e.target.value})} 
                                            />
                                        </div>
                                    </div>

                                    <div className="fs-header" style={{ marginTop: 20 }}>
                                        <h4>Executive Professional Summary</h4>
                                        <p>Concise, impact-driven overview highlighting your core strengths and architectural expertise.</p>
                                    </div>
                                    <div className="form-group">
                                        <textarea 
                                            rows={6}
                                            className="form-textarea-tall"
                                            value={resumeData.summary} 
                                            onChange={e => setResumeData({...resumeData, summary: e.target.value})} 
                                            placeholder="Write your comprehensive executive summary..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: TECHNICAL SKILLS */}
                            {activeTab === 'skills' && (
                                <div className="form-section">
                                    <div className="fs-header">
                                        <h4>5-Pillar Core Competencies Matrix</h4>
                                        <p>Structured keyword matrix matched against target job requirements. Type freely with full multi-line visibility.</p>
                                    </div>

                                    <div className="form-group">
                                        <label>Languages & Core Runtimes</label>
                                        <textarea 
                                            rows={2}
                                            className="form-textarea-skill"
                                            value={resumeData.skills.languages} 
                                            onChange={e => setResumeData({
                                                ...resumeData, 
                                                skills: { ...resumeData.skills, languages: e.target.value }
                                            })} 
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Frontend Frameworks & UI Architecture</label>
                                        <textarea 
                                            rows={2}
                                            className="form-textarea-skill"
                                            value={resumeData.skills.frontend} 
                                            onChange={e => setResumeData({
                                                ...resumeData, 
                                                skills: { ...resumeData.skills, frontend: e.target.value }
                                            })} 
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Backend, Microservices & API Design</label>
                                        <textarea 
                                            rows={2}
                                            className="form-textarea-skill"
                                            value={resumeData.skills.backend} 
                                            onChange={e => setResumeData({
                                                ...resumeData, 
                                                skills: { ...resumeData.skills, backend: e.target.value }
                                            })} 
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Databases & In-Memory Storage</label>
                                        <textarea 
                                            rows={2}
                                            className="form-textarea-skill"
                                            value={resumeData.skills.databases} 
                                            onChange={e => setResumeData({
                                                ...resumeData, 
                                                skills: { ...resumeData.skills, databases: e.target.value }
                                            })} 
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Cloud, DevOps & Automation Tooling</label>
                                        <textarea 
                                            rows={2}
                                            className="form-textarea-skill"
                                            value={resumeData.skills.tools} 
                                            onChange={e => setResumeData({
                                                ...resumeData, 
                                                skills: { ...resumeData.skills, tools: e.target.value }
                                            })} 
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: WORK EXPERIENCE */}
                            {activeTab === 'experience' && (
                                <div className="form-section">
                                    <div className="fs-header">
                                        <h4>Professional Experience</h4>
                                        <p>Action-oriented bullet points demonstrating metrics, scale, and technical depth.</p>
                                    </div>

                                    {resumeData.experience.map((exp, expIdx) => (
                                        <div key={expIdx} className="item-card-editor">
                                            <div className="form-grid-2">
                                                <div className="form-group">
                                                    <label>Job Title</label>
                                                    <input 
                                                        type="text" 
                                                        value={exp.title} 
                                                        onChange={e => {
                                                            const newExp = [...resumeData.experience];
                                                            newExp[expIdx].title = e.target.value;
                                                            setResumeData({ ...resumeData, experience: newExp });
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Company</label>
                                                    <input 
                                                        type="text" 
                                                        value={exp.company} 
                                                        onChange={e => {
                                                            const newExp = [...resumeData.experience];
                                                            newExp[expIdx].company = e.target.value;
                                                            setResumeData({ ...resumeData, experience: newExp });
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-grid-2">
                                                <div className="form-group">
                                                    <label>Duration / Dates</label>
                                                    <input 
                                                        type="text" 
                                                        value={exp.duration} 
                                                        onChange={e => {
                                                            const newExp = [...resumeData.experience];
                                                            newExp[expIdx].duration = e.target.value;
                                                            setResumeData({ ...resumeData, experience: newExp });
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Location</label>
                                                    <input 
                                                        type="text" 
                                                        value={exp.location} 
                                                        onChange={e => {
                                                            const newExp = [...resumeData.experience];
                                                            newExp[expIdx].location = e.target.value;
                                                            setResumeData({ ...resumeData, experience: newExp });
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <label className="bullets-label">STAR Achievement Bullets (Spacious Multi-Line View):</label>
                                            {exp.highlights.map((bullet, bIdx) => (
                                                <div key={bIdx} className="bullet-row-editor">
                                                    <textarea 
                                                        rows={4}
                                                        className="form-textarea-bullet"
                                                        value={bullet} 
                                                        onChange={e => handleUpdateExpBullet(expIdx, bIdx, e.target.value)} 
                                                    />
                                                    <button 
                                                        className="btn-del-bullet" 
                                                        onClick={() => handleRemoveExpBullet(expIdx, bIdx)}
                                                        title="Delete Bullet"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button className="btn-add-bullet" onClick={() => handleAddExpBullet(expIdx)}>
                                                <Plus size={14} /> Add Achievement Bullet
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* TAB 4: PROJECTS */}
                            {activeTab === 'projects' && (
                                <div className="form-section">
                                    <div className="fs-header">
                                        <h4>Featured Engineering & AI Projects</h4>
                                        <p>Showcase architectures, frameworks, latency improvements, and live outcomes.</p>
                                    </div>

                                    {resumeData.projects.map((proj, pIdx) => (
                                        <div key={pIdx} className="item-card-editor">
                                            <div className="form-grid-2">
                                                <div className="form-group">
                                                    <label>Project Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={proj.name} 
                                                        onChange={e => {
                                                            const newProj = [...resumeData.projects];
                                                            newProj[pIdx].name = e.target.value;
                                                            setResumeData({ ...resumeData, projects: newProj });
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Technologies Used</label>
                                                    <input 
                                                        type="text" 
                                                        value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies} 
                                                        onChange={e => {
                                                            const newProj = [...resumeData.projects];
                                                            newProj[pIdx].technologies = e.target.value.split(",").map(s => s.trim());
                                                            setResumeData({ ...resumeData, projects: newProj });
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <label className="bullets-label">Project Highlights (Spacious View):</label>
                                            {proj.highlights.map((bullet, bIdx) => (
                                                <div key={bIdx} className="bullet-row-editor">
                                                    <textarea 
                                                        rows={3}
                                                        className="form-textarea-bullet"
                                                        value={bullet} 
                                                        onChange={e => handleUpdateProjBullet(pIdx, bIdx, e.target.value)} 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* TAB 5: EDUCATION & CERTS */}
                            {activeTab === 'education' && (
                                <div className="form-section">
                                    <div className="fs-header">
                                        <h4>Education & Accreditations</h4>
                                        <p>Degrees, GPA, relevant computer science coursework, and credentials.</p>
                                    </div>

                                    <div className="item-card-editor">
                                        <div className="form-group">
                                            <label>Degree & Major</label>
                                            <input 
                                                type="text" 
                                                value={resumeData.education.degree} 
                                                onChange={e => setResumeData({
                                                    ...resumeData, 
                                                    education: { ...resumeData.education, degree: e.target.value }
                                                })} 
                                            />
                                        </div>
                                        <div className="form-grid-2">
                                            <div className="form-group">
                                                <label>University / Institution</label>
                                                <input 
                                                    type="text" 
                                                    value={resumeData.education.institution} 
                                                    onChange={e => setResumeData({
                                                        ...resumeData, 
                                                        education: { ...resumeData.education, institution: e.target.value }
                                                    })} 
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Graduation Year</label>
                                                <input 
                                                    type="text" 
                                                    value={resumeData.education.year} 
                                                    onChange={e => setResumeData({
                                                        ...resumeData, 
                                                        education: { ...resumeData.education, year: e.target.value }
                                                    })} 
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>GPA & Relevant Coursework Details</label>
                                            <textarea 
                                                rows={3}
                                                className="form-textarea-bullet"
                                                value={resumeData.education.details} 
                                                onChange={e => setResumeData({
                                                    ...resumeData, 
                                                    education: { ...resumeData.education, details: e.target.value }
                                                })} 
                                            />
                                        </div>
                                    </div>

                                    <div className="fs-header" style={{ marginTop: 16 }}>
                                        <h4>Certifications & Badges</h4>
                                    </div>
                                    {resumeData.certifications.map((cert, cIdx) => (
                                        <div key={cIdx} className="form-group" style={{ marginBottom: 10 }}>
                                            <input 
                                                type="text" 
                                                value={cert} 
                                                onChange={e => {
                                                    const newCerts = [...resumeData.certifications];
                                                    newCerts[cIdx] = e.target.value;
                                                    setResumeData({ ...resumeData, certifications: newCerts });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* TAB 6: ACHIEVEMENTS */}
                            {activeTab === 'achievements' && (
                                <div className="form-section">
                                    <div className="fs-header">
                                        <h4>Key Achievements & Open Source Leadership</h4>
                                        <p>Awards, hackathons, open-source repositories, and leadership milestones.</p>
                                    </div>

                                    {(resumeData.achievements || []).map((ach, aIdx) => (
                                        <div key={aIdx} className="form-group" style={{ marginBottom: 12 }}>
                                            <textarea 
                                                rows={3}
                                                className="form-textarea-bullet"
                                                value={ach} 
                                                onChange={e => {
                                                    const newAch = [...(resumeData.achievements || [])];
                                                    newAch[aIdx] = e.target.value;
                                                    setResumeData({ ...resumeData, achievements: newAch });
                                                }} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* ── INTERACTIVE DRAGGABLE RESIZER (<->) ── */}
                    <div 
                        className={`studio-splitter ${isDragging ? 'dragging' : ''}`}
                        onMouseDown={handleMouseDown}
                        title="Click & Drag to resize Editor / Preview panels (<->)"
                    >
                        <div className="splitter-handle">
                            <span className="splitter-arrow">‹</span>
                            <div className="splitter-grip-dots" />
                            <span className="splitter-arrow">›</span>
                        </div>
                    </div>

                    {/* ── RIGHT PANEL: Real-time Live A4 Document Canvas ── */}
                    <main className="studio-preview-panel" ref={previewContainerRef}>
                        <div 
                            className="preview-canvas-scroller" 
                            style={{ 
                                width: `${a4BaseWidth * effectiveScale}px`,
                                height: `${a4BaseHeight * effectiveScale}px`,
                                margin: '0 auto'
                            }}
                        >
                            <article 
                                className="a4-resume-sheet"
                                style={{
                                    transform: `scale(${effectiveScale})`,
                                    transformOrigin: 'top center',
                                    left: '50%',
                                    marginLeft: `-${a4BaseWidth / 2}px`
                                }}
                            >
                                {/* Header */}
                                <header className="res-header">
                                    <h1>{resumeData.candidateName}</h1>
                                    <div className="res-target-role">{resumeData.targetRole}</div>
                                    <div className="res-contact-bar">
                                        <span>📍 {resumeData.location}</span> •
                                        <span>✉️ {resumeData.email}</span> •
                                        <span>📞 {resumeData.phone}</span> •
                                        <span>🔗 {resumeData.linkedin.replace(/^https?:\/\//, '')}</span> •
                                        <span>💻 {resumeData.github.replace(/^https?:\/\//, '')}</span>
                                    </div>
                                </header>

                                {/* Summary */}
                                <section className="res-section">
                                    <h3 className="res-section-title">Executive Professional Summary</h3>
                                    <p className="res-summary-text">{resumeData.summary}</p>
                                </section>

                                {/* Skills */}
                                <section className="res-section">
                                    <h3 className="res-section-title">Technical Skills & Competency Matrix</h3>
                                    <table className="res-skills-table">
                                        <tbody>
                                            <tr>
                                                <td className="res-skills-label">Languages & Runtimes:</td>
                                                <td className="res-skills-content">{resumeData.skills.languages}</td>
                                            </tr>
                                            <tr>
                                                <td className="res-skills-label">Frontend & UI:</td>
                                                <td className="res-skills-content">{resumeData.skills.frontend}</td>
                                            </tr>
                                            <tr>
                                                <td className="res-skills-label">Backend & Architecture:</td>
                                                <td className="res-skills-content">{resumeData.skills.backend}</td>
                                            </tr>
                                            <tr>
                                                <td className="res-skills-label">Databases & Caching:</td>
                                                <td className="res-skills-content">{resumeData.skills.databases}</td>
                                            </tr>
                                            <tr>
                                                <td className="res-skills-label">Cloud, DevOps & Tools:</td>
                                                <td className="res-skills-content">{resumeData.skills.tools}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </section>

                                {/* Experience */}
                                <section className="res-section">
                                    <h3 className="res-section-title">Professional Experience</h3>
                                    {resumeData.experience.map((exp, i) => (
                                        <div key={i} className="res-entry">
                                            <div className="res-entry-header">
                                                <div>
                                                    <span className="res-entry-title">{exp.title}</span> — 
                                                    <span className="res-entry-subtitle"> {exp.company}</span>
                                                </div>
                                                <span className="res-entry-date">{exp.duration} | {exp.location}</span>
                                            </div>
                                            <ul className="res-bullets">
                                                {exp.highlights.map((h, hIdx) => (
                                                    <li key={hIdx}>{h}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </section>

                                {/* Projects */}
                                <section className="res-section">
                                    <h3 className="res-section-title">Featured Engineering & AI Systems</h3>
                                    {resumeData.projects.map((proj, i) => (
                                        <div key={i} className="res-entry">
                                            <div className="res-entry-header">
                                                <div>
                                                    <span className="res-entry-title">{proj.name}</span>
                                                </div>
                                                <span className="res-entry-date">
                                                    {Array.isArray(proj.technologies) ? proj.technologies.join(" · ") : proj.technologies}
                                                </span>
                                            </div>
                                            <ul className="res-bullets">
                                                {proj.highlights.map((h, hIdx) => (
                                                    <li key={hIdx}>{h}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </section>

                                {/* Education & Certs */}
                                <section className="res-section">
                                    <div className="res-split-grid">
                                        <div className="res-split-col">
                                            <h3 className="res-section-title">Education & Credentials</h3>
                                            <div className="res-edu-degree">{resumeData.education.degree}</div>
                                            <div className="res-edu-inst">
                                                {resumeData.education.institution} 
                                                <span style={{ float: 'right', fontWeight: 'normal', color: '#64748b' }}>
                                                    {resumeData.education.year}
                                                </span>
                                            </div>
                                            <div className="res-edu-detail">{resumeData.education.details}</div>
                                        </div>

                                        <div className="res-split-col">
                                            <h3 className="res-section-title">Certifications & Honors</h3>
                                            {resumeData.certifications.map((c, i) => (
                                                <div key={i} className="res-cert-item">
                                                    • <strong>{c.split(':')[0] || c}:</strong> {c.split(':')[1] || ''}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Achievements & Open Source */}
                                <section className="res-section" style={{ marginBottom: 0 }}>
                                    <h3 className="res-section-title">Key Achievements & Open Source Contributions</h3>
                                    <ul className="res-bullets">
                                        {(resumeData.achievements || []).map((a, i) => (
                                            <li key={i}>{a}</li>
                                        ))}
                                    </ul>
                                </section>
                            </article>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
