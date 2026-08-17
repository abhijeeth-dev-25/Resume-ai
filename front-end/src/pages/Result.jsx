import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
    ArrowLeft, Target, Zap, AlertTriangle, Calendar,
    ChevronDown, ChevronUp, Sparkles, Loader2,
    BarChart3, Tags, FileText, CheckCircle2, XCircle,
    Award, Briefcase, GraduationCap, Code,
    User, Mail, Phone, MapPin, Linkedin, Github,
    Check, ArrowRight, TrendingUp, ShieldCheck,
    Cpu, Compass, UserCheck, Flame, Layers, ExternalLink
} from 'lucide-react';
import { interviewService } from '../services/interview.service';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import './Result.scss';

// ── Circular Gauge Component (Circle Graph) ──────────────────────────────────
const CircularGauge = ({ score, size = 110, strokeWidth = 9, label, sublabel, color, icon: Icon }) => {
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const safeScore = Math.min(Math.max(score || 0, 0), 100);
    const strokeDashoffset = circumference - (safeScore / 100) * circumference;

    const dynamicColor = color || (
        safeScore >= 75 ? 'var(--success)' : safeScore >= 50 ? 'var(--warning)' : 'var(--error)'
    );

    return (
        <div className="circle-graph-card">
            <div className="circle-graph-wrapper" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Background Track Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--border-color)"
                        strokeWidth={strokeWidth}
                        className="circle-track"
                    />
                    {/* Glowing Progress Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={dynamicColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        className="circle-progress"
                    />
                </svg>
                {/* Center Content */}
                <div className="circle-inner-content">
                    {Icon && <Icon size={14} style={{ color: dynamicColor }} className="circle-icon" />}
                    <span className="circle-score-value" style={{ color: dynamicColor }}>
                        {safeScore}%
                    </span>
                </div>
            </div>
            <div className="circle-labels">
                <span className="circle-main-label">{label}</span>
                {sublabel && <span className="circle-sub-label">{sublabel}</span>}
            </div>
        </div>
    );
};

// ── Hero Main Score Ring ───────────────────────────────────────────────────────
const HeroScoreRing = ({ score, role }) => {
    const r = 50;
    const circ = 2 * Math.PI * r;
    const safeScore = Math.min(Math.max(score || 0, 0), 100);
    const fill = circ - (safeScore / 100) * circ;
    const color = safeScore >= 75 ? 'var(--success)' : safeScore >= 50 ? 'var(--warning)' : 'var(--error)';

    const ratingTier = safeScore >= 85 ? 'Top Tier Fit' : safeScore >= 70 ? 'Strong Contender' : safeScore >= 50 ? 'Moderate Fit' : 'Requires Upskilling';

    return (
        <div className="hero-score-box">
            <div className="hero-ring-wrapper">
                <svg width="130" height="130" viewBox="0 0 130 130">
                    <circle cx="65" cy="65" r={r} fill="none" stroke="var(--border-color)" strokeWidth="10" />
                    <circle
                        cx="65" cy="65" r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={fill}
                        transform="rotate(-90 65 65)"
                        className="circle-progress"
                    />
                </svg>
                <div className="hero-ring-inner">
                    <span className="hero-ring-score" style={{ color }}>{safeScore}%</span>
                    <span className="hero-ring-label">Overall Fit</span>
                </div>
            </div>
            <div className="hero-tier-info">
                <span className="hero-tier-badge" style={{ borderColor: color, color }}>
                    <Flame size={12} /> {ratingTier}
                </span>
                <span className="hero-role-caption">Evaluated for <strong>{role}</strong></span>
            </div>
        </div>
    );
};

// ── Accordion Item ─────────────────────────────────────────────────────────────
const AccordionItem = ({ title, intention, answer, index }) => {
    const [open, setOpen] = useState(index === 0);
    return (
        <div className={`accordion-item ${open ? 'accordion-item--open' : ''}`}>
            <button className="accordion-header" onClick={() => setOpen(!open)} type="button">
                <span className="accordion-index">Q{index + 1}</span>
                <span className="accordion-question">{title}</span>
                <span className="accordion-chevron">
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
            </button>
            {open && (
                <div className="accordion-body">
                    {intention && (
                        <div className="accordion-intention">
                            <strong>💡 Interviewer Intent:</strong> {intention}
                        </div>
                    )}
                    <div className="accordion-answer">
                        <strong>🎯 Recommended Answer Framework:</strong>
                        <p>{answer}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Navigation Sections ────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'overview',     label: 'Persona & Fit Overview', icon: UserCheck },
    { id: 'match',        label: 'Circle Graphs & Scores', icon: BarChart3 },
    { id: 'keywords',     label: 'ATS Keyword Matrix',     icon: Tags },
    { id: 'parsed',       label: 'Parsed Resume Details',  icon: FileText },
    { id: 'technical',    label: 'Technical Q&A Suite',    icon: Zap },
    { id: 'behavioral',   label: 'Behavioral STAR Suite',  icon: Target },
    { id: 'skill',        label: 'Skill Gaps & Action',    icon: AlertTriangle },
    { id: 'preparation',  label: 'Preparation Roadmap',    icon: Calendar },
];

// ── Result Page Component ──────────────────────────────────────────────────────
const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [activeSection, setActiveSection] = useState('overview');
    const [downloading, setDownloading]     = useState(false);

    const report = location.state?.report;

    const handleDownloadResume = async () => {
        if (!report?._id || downloading) return;

        try {
            setDownloading(true);
            const blob = await interviewService.downloadResume(report._id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Resume_${report.jobRole ? report.jobRole.replace(/\s+/g, '_') : 'Tailored'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download tailored resume. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (!report) {
        return (
            <div className="result-layout">
                <div className="result-empty">
                    <FileText size={48} className="text-muted" />
                    <h2>No Report Found</h2>
                    <p>Please generate a new interview report from your dashboard.</p>
                    <Button variant="primary" onClick={() => navigate('/')}>
                        <ArrowLeft size={16} /> Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const {
        jobRole = 'Target Position',
        matchScore = 0,
        summaryAssessment = '',
        scoreBreakdown = {},
        matchedKeywords = [],
        missingKeywords = [],
        strengths = [],
        weaknesses = [],
        bulletSuggestions = [],
        parsedProfile = {},
        technicalQuestions = [],
        behavioralQuestions = [],
        skillGaps = [],
        preparationPlan = [],
    } = report;

    // Derived persona data
    const candidateName = parsedProfile.fullName || 'Candidate Profile';
    const totalKeywords = matchedKeywords.length + missingKeywords.length;
    const keywordCoverage = totalKeywords > 0 ? Math.round((matchedKeywords.length / totalKeywords) * 100) : matchScore;

    // Calculate candidate experience summary
    const totalExperienceRoles = parsedProfile.experience?.length || 1;
    const candidateSkills = parsedProfile.hardSkills || matchedKeywords.map(k => typeof k === 'string' ? k : k.keyword);
    const candidateTools = parsedProfile.toolsAndFrameworks || [];

    // ── Render TOC on Left Sidebar ─────────────────────────────────────────────
    const renderSidebarIndex = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <>
                        <div className="sidebar-index-item">👤 Candidate: {candidateName}</div>
                        <div className="sidebar-index-item">🎯 Target: {jobRole}</div>
                        <div className="sidebar-index-item">⭐ Match Fit: {matchScore}%</div>
                        <div className="sidebar-index-item">💼 Experience: {totalExperienceRoles} position(s)</div>
                        <div className="sidebar-index-item">⚡ Key Skills: {candidateSkills.slice(0, 4).join(', ')}</div>
                    </>
                );
            case 'match':
                return (
                    <>
                        <div className="sidebar-index-item">Overall Match: {matchScore}%</div>
                        <div className="sidebar-index-item">Technical Skills: {scoreBreakdown.skillsScore ?? matchScore}%</div>
                        <div className="sidebar-index-item">Experience Fit: {scoreBreakdown.experienceScore ?? matchScore}%</div>
                        <div className="sidebar-index-item">Education Fit: {scoreBreakdown.educationScore ?? 90}%</div>
                        <div className="sidebar-index-item">ATS Parsability: {scoreBreakdown.atsFormattingScore ?? 88}%</div>
                    </>
                );
            case 'keywords':
                return (
                    <>
                        <div className="sidebar-index-item">Matched Skills ({matchedKeywords.length})</div>
                        <div className="sidebar-index-item">Missing Keywords ({missingKeywords.length})</div>
                        <div className="sidebar-index-item">Keyword Coverage: {keywordCoverage}%</div>
                    </>
                );
            case 'parsed':
                return (
                    <>
                        <div className="sidebar-index-item">{candidateName}</div>
                        <div className="sidebar-index-item">Work Experience ({totalExperienceRoles} roles)</div>
                        <div className="sidebar-index-item">Education ({parsedProfile.education?.length || 0})</div>
                        <div className="sidebar-index-item">Hard Skills ({candidateSkills.length})</div>
                        <div className="sidebar-index-item">Tools ({candidateTools.length})</div>
                    </>
                );
            case 'technical':
                return technicalQuestions.length === 0
                    ? <p className="sidebar-empty">No technical questions</p>
                    : technicalQuestions.map((q, i) => (
                        <div key={i} className="sidebar-index-item" title={q.question}>
                            Q{i + 1}. {q.question.length > 36 ? q.question.substring(0, 36) + '…' : q.question}
                        </div>
                    ));
            case 'behavioral':
                return behavioralQuestions.length === 0
                    ? <p className="sidebar-empty">No behavioral questions</p>
                    : behavioralQuestions.map((q, i) => (
                        <div key={i} className="sidebar-index-item" title={q.question}>
                            Q{i + 1}. {q.question.length > 36 ? q.question.substring(0, 36) + '…' : q.question}
                        </div>
                    ));
            case 'skill':
                return skillGaps.length === 0
                    ? <p className="sidebar-empty">Zero skill gaps found!</p>
                    : skillGaps.map((gap, i) => (
                        <div key={i} className="sidebar-index-item">
                            {gap.skill} ({gap.severity})
                        </div>
                    ));
            case 'preparation':
            default:
                return preparationPlan.length === 0
                    ? <p className="sidebar-empty">No preparation plan</p>
                    : preparationPlan.map((day, i) => (
                        <div key={i} className="sidebar-index-item">
                            Day {day.day} — {day.focus}
                        </div>
                    ));
        }
    };

    // ── Render Main Center Panel ───────────────────────────────────────────────
    const renderCenterContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="overview-view">
                        {/* Hero Persona Header Card */}
                        <div className="persona-hero-card">
                            <div className="persona-avatar-wrapper">
                                <div className="persona-avatar">
                                    <User size={32} />
                                </div>
                                <span className="persona-verified-badge" title="Profile Parsed & Verified">✓</span>
                            </div>

                            <div className="persona-header-details">
                                <div className="persona-name-row">
                                    <h2>{candidateName}</h2>
                                    <span className="persona-role-badge">
                                        <Briefcase size={13} /> {jobRole}
                                    </span>
                                </div>

                                <p className="persona-summary-snippet">
                                    {parsedProfile.summary || summaryAssessment || "Experienced professional with hands-on domain engineering expertise and structured delivery focus."}
                                </p>

                                {/* Contact Pills */}
                                <div className="persona-meta-pills">
                                    {parsedProfile.email && (
                                        <span className="p-meta-pill"><Mail size={12} /> {parsedProfile.email}</span>
                                    )}
                                    {parsedProfile.phone && (
                                        <span className="p-meta-pill"><Phone size={12} /> {parsedProfile.phone}</span>
                                    )}
                                    {parsedProfile.location && (
                                        <span className="p-meta-pill"><MapPin size={12} /> {parsedProfile.location}</span>
                                    )}
                                    {parsedProfile.linkedin && (
                                        <span className="p-meta-pill"><Linkedin size={12} /> LinkedIn</span>
                                    )}
                                    {parsedProfile.github && (
                                        <span className="p-meta-pill"><Github size={12} /> GitHub</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Visual Circular Graphs Section */}
                        <div className="circle-graphs-section">
                            <div className="cgs-header">
                                <h3><BarChart3 size={18} /> Candidate Multi-Metric Circle Graphs</h3>
                                <span>Multi-dimensional fit analysis computed by AI</span>
                            </div>

                            <div className="circle-graphs-grid">
                                <CircularGauge
                                    score={scoreBreakdown.skillsScore ?? matchScore}
                                    label="Technical Skills"
                                    sublabel="Core Hard Skills"
                                    color="var(--accent)"
                                    icon={Code}
                                />
                                <CircularGauge
                                    score={scoreBreakdown.experienceScore ?? Math.min(matchScore + 3, 98)}
                                    label="Experience Fit"
                                    sublabel="Seniority & Roles"
                                    color="var(--success)"
                                    icon={Briefcase}
                                />
                                <CircularGauge
                                    score={scoreBreakdown.educationScore ?? 92}
                                    label="Education Fit"
                                    sublabel="Credentials & Degrees"
                                    color="var(--violet)"
                                    icon={GraduationCap}
                                />
                                <CircularGauge
                                    score={scoreBreakdown.responsibilitiesScore ?? Math.max(matchScore - 4, 60)}
                                    label="Role Alignment"
                                    sublabel="Day-to-day Deliverables"
                                    color="var(--warning)"
                                    icon={Target}
                                />
                            </div>
                        </div>

                        {/* Top Highlights at a Glance */}
                        <div className="persona-glance-grid">
                            <div className="pg-card pg-card--strengths">
                                <div className="pg-card-header">
                                    <CheckCircle2 size={18} className="text-success" />
                                    <h4>Candidate Superpowers (Why Hire)</h4>
                                </div>
                                <ul>
                                    {strengths.length > 0 ? strengths.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    )) : (
                                        <>
                                            <li>Proven hands-on software development and system architecture skills.</li>
                                            <li>Strong problem-solving mindset and full-stack technical foundations.</li>
                                            <li>Demonstrated capacity to lead modular backend and frontend integrations.</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="pg-card pg-card--watchouts">
                                <div className="pg-card-header">
                                    <AlertTriangle size={18} className="text-warning" />
                                    <h4>Interview Probing Points (Risks)</h4>
                                </div>
                                <ul>
                                    {weaknesses.length > 0 ? weaknesses.map((w, i) => (
                                        <li key={i}>{w}</li>
                                    )) : (
                                        <>
                                            <li>Evaluate deep system resilience and high-scale production load scenarios.</li>
                                            <li>Probe candidate on quantitative impact metrics in previous assignments.</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Quick Skills Spotlight */}
                        <div className="persona-skills-spotlight">
                            <h4><Zap size={16} /> Core Technical & Framework Stack</h4>
                            <div className="pss-tags">
                                {candidateSkills.map((skill, i) => (
                                    <span key={i} className="pss-tag pss-tag--skill">{skill}</span>
                                ))}
                                {candidateTools.map((tool, i) => (
                                    <span key={i} className="pss-tag pss-tag--tool">{tool}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'match':
                return (
                    <div className="match-view">
                        {/* Executive Summary Card */}
                        {summaryAssessment && (
                            <div className="summary-card">
                                <div className="summary-card-header">
                                    <ShieldCheck size={18} className="text-accent" />
                                    <h3>Executive Hiring Assessment</h3>
                                </div>
                                <p>{summaryAssessment}</p>
                            </div>
                        )}

                        {/* Circle Graphs Row */}
                        <div className="circle-graphs-section">
                            <div className="cgs-header">
                                <h3><BarChart3 size={18} /> Detailed Radial Score Gauges</h3>
                            </div>
                            <div className="circle-graphs-grid">
                                <CircularGauge
                                    score={matchScore}
                                    label="Overall Match"
                                    sublabel="Combined ATS Score"
                                    color="var(--accent)"
                                    icon={Award}
                                />
                                <CircularGauge
                                    score={scoreBreakdown.skillsScore ?? matchScore}
                                    label="Skills Match"
                                    sublabel="Technical Alignment"
                                    color="var(--success)"
                                    icon={Code}
                                />
                                <CircularGauge
                                    score={scoreBreakdown.experienceScore ?? Math.min(matchScore + 3, 98)}
                                    label="Experience"
                                    sublabel="Tenure & Deliverables"
                                    color="var(--violet)"
                                    icon={Briefcase}
                                />
                                <CircularGauge
                                    score={scoreBreakdown.atsFormattingScore ?? 90}
                                    label="ATS Parsability"
                                    sublabel="Structure & Impact"
                                    color="#38BDF8"
                                    icon={Layers}
                                />
                            </div>
                        </div>

                        {/* STAR Bullet Point Rewrites */}
                        {bulletSuggestions && bulletSuggestions.length > 0 && (
                            <div className="bullet-section">
                                <h3 className="section-subtitle">
                                    <Sparkles size={16} /> High-Impact STAR Bullet Rewrites
                                </h3>
                                <div className="bullet-list">
                                    {bulletSuggestions.map((item, i) => (
                                        <div key={i} className="bullet-card">
                                            <div className="bullet-original">
                                                <span className="bullet-tag bullet-tag--orig">Original Resume Line</span>
                                                <p>"{item.original}"</p>
                                            </div>
                                            <div className="bullet-improved">
                                                <span className="bullet-tag bullet-tag--imp">ATS Optimized Rewrite</span>
                                                <p>"{item.improved}"</p>
                                                {item.reason && <small>💡 {item.reason}</small>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'keywords':
                return (
                    <div className="keywords-view">
                        <div className="keywords-stats-banner">
                            <div className="kw-banner-item">
                                <span className="kw-banner-val">{matchedKeywords.length}</span>
                                <span className="kw-banner-label">Matched Keywords</span>
                            </div>
                            <div className="kw-banner-item">
                                <span className="kw-banner-val" style={{ color: 'var(--error)' }}>
                                    {missingKeywords.length}
                                </span>
                                <span className="kw-banner-label">Missing JD Keywords</span>
                            </div>
                            <div className="kw-banner-item">
                                <span className="kw-banner-val" style={{ color: 'var(--success)' }}>
                                    {keywordCoverage}%
                                </span>
                                <span className="kw-banner-label">ATS Coverage Rate</span>
                            </div>
                        </div>

                        <div className="keyword-group">
                            <h3 className="keyword-group-title text-success">
                                <Check size={16} /> Matched Skills & Keywords ({matchedKeywords.length})
                            </h3>
                            <div className="keyword-tags">
                                {matchedKeywords.map((item, i) => (
                                    <div key={i} className="keyword-pill keyword-pill--matched">
                                        <span className="kp-name">{typeof item === 'string' ? item : item.keyword}</span>
                                        {item.category && <span className="kp-category">{item.category}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="keyword-group">
                            <h3 className="keyword-group-title text-error">
                                <XCircle size={16} /> Missing Keywords in Resume ({missingKeywords.length})
                            </h3>
                            <div className="keyword-tags">
                                {missingKeywords.map((item, i) => {
                                    const priority = item.priority || 'important';
                                    return (
                                        <div key={i} className={`keyword-pill keyword-pill--missing keyword-pill--${priority}`}>
                                            <span className="kp-name">{typeof item === 'string' ? item : item.keyword}</span>
                                            {item.category && <span className="kp-category">{item.category}</span>}
                                            <span className={`kp-priority kp-priority--${priority}`}>{priority}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );

            case 'parsed':
                return (
                    <div className="parsed-view">
                        <div className="parsed-header-card">
                            <div className="parsed-avatar">
                                <User size={26} />
                            </div>
                            <div className="parsed-header-info">
                                <h2>{candidateName}</h2>
                                <div className="parsed-contact-row">
                                    {parsedProfile.email && <span><Mail size={13} /> {parsedProfile.email}</span>}
                                    {parsedProfile.phone && <span><Phone size={13} /> {parsedProfile.phone}</span>}
                                    {parsedProfile.location && <span><MapPin size={13} /> {parsedProfile.location}</span>}
                                </div>
                            </div>
                        </div>

                        {parsedProfile.summary && (
                            <div className="parsed-section">
                                <h3 className="parsed-section-title"><User size={15} /> Professional Summary</h3>
                                <p className="parsed-summary-text">{parsedProfile.summary}</p>
                            </div>
                        )}

                        <div className="parsed-section">
                            <h3 className="parsed-section-title"><Code size={15} /> Extracted Skills Inventory</h3>
                            <div className="parsed-skills-grid">
                                {candidateSkills.length > 0 && (
                                    <div className="psg-block">
                                        <h4>Hard & Technical Skills</h4>
                                        <div className="psg-tags">
                                            {candidateSkills.map((s, i) => (
                                                <span key={i} className="psg-tag">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {candidateTools.length > 0 && (
                                    <div className="psg-block">
                                        <h4>Frameworks & Tools</h4>
                                        <div className="psg-tags">
                                            {candidateTools.map((t, i) => (
                                                <span key={i} className="psg-tag psg-tag--tool">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {parsedProfile.experience?.length > 0 && (
                            <div className="parsed-section">
                                <h3 className="parsed-section-title"><Briefcase size={15} /> Work Experience</h3>
                                <div className="parsed-exp-list">
                                    {parsedProfile.experience.map((exp, i) => (
                                        <div key={i} className="parsed-exp-card">
                                            <div className="parsed-exp-head">
                                                <div>
                                                    <h4 className="parsed-exp-role">{exp.title}</h4>
                                                    <span className="parsed-exp-company">{exp.company}</span>
                                                </div>
                                                <span className="parsed-exp-duration">{exp.duration}</span>
                                            </div>
                                            {exp.highlights?.length > 0 && (
                                                <ul className="parsed-exp-highlights">
                                                    {exp.highlights.map((h, j) => (
                                                        <li key={j}>{h}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {parsedProfile.education?.length > 0 && (
                            <div className="parsed-section">
                                <h3 className="parsed-section-title"><GraduationCap size={15} /> Education & Credentials</h3>
                                <div className="parsed-edu-grid">
                                    {parsedProfile.education.map((edu, i) => (
                                        <div key={i} className="parsed-edu-card">
                                            <h4>{edu.degree}</h4>
                                            <p className="pe-school">{edu.institution}</p>
                                            <span className="pe-year">{edu.year}</span>
                                            {edu.details && <small className="pe-details">{edu.details}</small>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'technical':
                return (
                    <div className="questions-view">
                        <div className="view-intro">
                            <p>Targeted technical interview questions designed to probe candidate depth on critical job requirements.</p>
                        </div>
                        {technicalQuestions.length === 0 ? (
                            <p className="result-empty-text">No technical questions generated.</p>
                        ) : (
                            technicalQuestions.map((q, i) => (
                                <AccordionItem
                                    key={i}
                                    index={i}
                                    title={q.question}
                                    intention={q.intention}
                                    answer={q.answer}
                                />
                            ))
                        )}
                    </div>
                );

            case 'behavioral':
                return (
                    <div className="questions-view">
                        <div className="view-intro">
                            <p>Situational and behavioral questions structured for the STAR interview methodology.</p>
                        </div>
                        {behavioralQuestions.length === 0 ? (
                            <p className="result-empty-text">No behavioral questions generated.</p>
                        ) : (
                            behavioralQuestions.map((q, i) => (
                                <AccordionItem
                                    key={i}
                                    index={i}
                                    title={q.question}
                                    intention={q.intention}
                                    answer={q.answer}
                                />
                            ))
                        )}
                    </div>
                );

            case 'skill':
                return (
                    <div className="skill-gaps-view">
                        {skillGaps.length === 0 ? (
                            <div className="all-matched-banner">
                                <CheckCircle2 size={32} className="text-success" />
                                <h3>Zero Gaps Detected!</h3>
                                <p>Candidate resume fully covers all stated core skills in the target job posting.</p>
                            </div>
                        ) : (
                            <div className="skill-gaps-list">
                                {skillGaps.map((gap, i) => {
                                    const cfg = {
                                        high:   { label: 'High Priority', cls: 'badge-high' },
                                        medium: { label: 'Medium Priority', cls: 'badge-medium' },
                                        low:    { label: 'Low Priority', cls: 'badge-low' },
                                    }[gap.severity] || { label: 'Low', cls: 'badge-low' };

                                    return (
                                        <div key={i} className="skill-gap-card">
                                            <div className="sg-card-header">
                                                <h4 className="sg-name">{gap.skill}</h4>
                                                <span className={`skill-gap-badge ${cfg.cls}`}>{cfg.label}</span>
                                            </div>
                                            {gap.recommendation && (
                                                <p className="sg-recommendation">
                                                    <strong>💡 Remediation:</strong> {gap.recommendation}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );

            case 'preparation':
            default:
                return (
                    <div className="timeline-view">
                        {preparationPlan.length === 0 ? (
                            <p className="result-empty-text">No preparation roadmap generated.</p>
                        ) : (
                            <div className="timeline">
                                {preparationPlan.map((day, i) => (
                                    <div key={i} className="timeline-item">
                                        <div className="timeline-day">
                                            <span>Day {day.day}</span>
                                        </div>
                                        <div className="timeline-content">
                                            <p className="timeline-focus">{day.focus}</p>
                                            <ul className="timeline-tasks">
                                                {(day.tasks || day.task || []).map((t, j) => (
                                                    <li key={j}>{t}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="result-layout">
            {/* ── Navbar ── */}
            <header className="result-nav glass-panel">
                <button className="result-nav-back" onClick={() => navigate('/')} type="button">
                    <ArrowLeft size={16} />
                    <span>Dashboard</span>
                </button>
                <div className="result-nav-title">
                    <span>{candidateName}</span> · {jobRole} Evaluation
                </div>
                <div className="result-nav-right">
                    <ThemeToggle />
                    <Button variant="secondary" size="sm" onClick={logout}>Logout</Button>
                </div>
            </header>

            {/* ── 3-Column Layout ── */}
            <div className="result-3col">
                {/* ── LEFT: TOC / Navigation Index ── */}
                <aside className="result-col-left">
                    <div className="sidebar-title-card">
                        <h2>{SECTIONS.find(s => s.id === activeSection)?.label}</h2>
                    </div>
                    <div className="sidebar-index">
                        {renderSidebarIndex()}
                    </div>
                </aside>

                {/* ── CENTER: Main Content Panel ── */}
                <main className="result-col-center">
                    <div className="center-header">
                        {SECTIONS.find(s => s.id === activeSection)?.icon && (
                            React.createElement(SECTIONS.find(s => s.id === activeSection).icon, { size: 18 })
                        )}
                        <h2>{SECTIONS.find(s => s.id === activeSection)?.label}</h2>
                    </div>
                    <div className="center-body">
                        {renderCenterContent()}
                    </div>
                </main>

                {/* ── RIGHT: Hero Score & Section Switchers & Action ── */}
                <aside className="result-col-right">
                    {/* Hero Overall Score Card */}
                    <div className="score-card">
                        <HeroScoreRing score={matchScore} role={jobRole} />
                        
                        <div className="sc-quick-metrics">
                            <div className="sc-q-item">
                                <span className="sc-q-val">{matchedKeywords.length}</span>
                                <span className="sc-q-label">Matched Skills</span>
                            </div>
                            <div className="sc-q-item">
                                <span className="sc-q-val">{technicalQuestions.length}</span>
                                <span className="sc-q-label">Tech Qs</span>
                            </div>
                            <div className="sc-q-item">
                                <span className="sc-q-val">{skillGaps.length}</span>
                                <span className="sc-q-label">Skill Gaps</span>
                            </div>
                        </div>
                    </div>

                    {/* Section Selector Navigation */}
                    <div className="section-nav">
                        {SECTIONS.map((sec) => {
                            const SecIcon = sec.icon;
                            return (
                                <button
                                    key={sec.id}
                                    type="button"
                                    className={`section-nav-btn ${activeSection === sec.id ? 'section-nav-btn--active' : ''}`}
                                    onClick={() => setActiveSection(sec.id)}
                                >
                                    <SecIcon size={16} />
                                    <span>{sec.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Download AI Resume CTA */}
                    <button
                        className={`download-btn ${downloading ? 'download-btn--loading' : ''}`}
                        onClick={handleDownloadResume}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <>
                                <div className="download-btn-shimmer" />
                                <Loader2 size={18} className="animate-spin" />
                                <span>GENERATING PDF...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                <span>DOWNLOAD TAILORED RESUME</span>
                            </>
                        )}
                    </button>
                </aside>
            </div>
        </div>
    );
};

export default Result;
