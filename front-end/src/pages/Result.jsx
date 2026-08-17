import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
    ArrowLeft, Target, Zap, AlertTriangle, Calendar,
    ChevronDown, ChevronUp, Sparkles, Loader2,
    BarChart3, Tags, FileText, CheckCircle2, XCircle,
    Award, Briefcase, GraduationCap, Code,
    User, Mail, Phone, MapPin, Linkedin, Github,
    Check, ArrowRight, TrendingUp, ShieldCheck
} from 'lucide-react';
import { interviewService } from '../services/interview.service';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import './Result.scss';

// ── Score ring component ───────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
    const r = 38;
    const circ = 2 * Math.PI * r;
    const fill = circ - (Math.min(Math.max(score, 0), 100) / 100) * circ;
    const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--error)';

    return (
        <div className="score-ring-wrapper">
            <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r={r} fill="none" stroke="var(--border-color)" strokeWidth="8" />
                <circle
                    cx="48" cy="48" r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={fill}
                    transform="rotate(-90 48 48)"
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
            </svg>
            <div className="score-ring-inner">
                <span className="score-ring-value" style={{ color }}>{score}%</span>
                <span className="score-ring-label">Match</span>
            </div>
        </div>
    );
};

// ── Progress bar component ─────────────────────────────────────────────────────
const ProgressBar = ({ label, score, color = 'var(--accent)' }) => {
    const safeScore = Math.min(Math.max(score || 0, 0), 100);
    return (
        <div className="prog-bar-container">
            <div className="prog-bar-header">
                <span className="prog-bar-label">{label}</span>
                <span className="prog-bar-val">{safeScore}%</span>
            </div>
            <div className="prog-bar-track">
                <div
                    className="prog-bar-fill"
                    style={{ width: `${safeScore}%`, background: color }}
                />
            </div>
        </div>
    );
};

// ── Accordion item ─────────────────────────────────────────────────────────────
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
                        <strong>🎯 Recommended Answer Approach:</strong>
                        <p>{answer}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Navigation Sections ────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'match',        label: 'Match & Breakdown',    icon: BarChart3 },
    { id: 'keywords',     label: 'ATS Keyword Matrix',   icon: Tags },
    { id: 'parsed',       label: 'Parsed Resume Profile',icon: FileText },
    { id: 'technical',    label: 'Technical Questions',  icon: Zap },
    { id: 'behavioral',   label: 'Behavioral Questions', icon: Target },
    { id: 'skill',        label: 'Skill Gaps & Fixes',   icon: AlertTriangle },
    { id: 'preparation',  label: 'Preparation Roadmap',  icon: Calendar },
];

// ── Result Page Component ──────────────────────────────────────────────────────
const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [activeSection, setActiveSection] = useState('match');
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
        jobRole = 'Target Role',
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

    // Calculate keyword coverage
    const totalKeywords = matchedKeywords.length + missingKeywords.length;
    const keywordCoverage = totalKeywords > 0 ? Math.round((matchedKeywords.length / totalKeywords) * 100) : matchScore;

    // ── Render TOC on left sidebar ─────────────────────────────────────────────
    const renderSidebarIndex = () => {
        switch (activeSection) {
            case 'match':
                return (
                    <>
                        <div className="sidebar-index-item">Overall Match: {matchScore}%</div>
                        <div className="sidebar-index-item">Dimensional Scores ({Object.keys(scoreBreakdown).length || 5})</div>
                        <div className="sidebar-index-item">Strengths ({strengths.length})</div>
                        <div className="sidebar-index-item">Weaknesses / Risks ({weaknesses.length})</div>
                        <div className="sidebar-index-item">STAR Bullet Rewrites ({bulletSuggestions.length})</div>
                    </>
                );
            case 'keywords':
                return (
                    <>
                        <div className="sidebar-index-item">Matched Skills ({matchedKeywords.length})</div>
                        <div className="sidebar-index-item">Missing Keywords ({missingKeywords.length})</div>
                        <div className="sidebar-index-item">Coverage Rate: {keywordCoverage}%</div>
                    </>
                );
            case 'parsed':
                return (
                    <>
                        <div className="sidebar-index-item">{parsedProfile.fullName || 'Candidate Profile'}</div>
                        <div className="sidebar-index-item">Experience ({parsedProfile.experience?.length || 0} roles)</div>
                        <div className="sidebar-index-item">Education ({parsedProfile.education?.length || 0})</div>
                        <div className="sidebar-index-item">Hard Skills ({parsedProfile.hardSkills?.length || 0})</div>
                        <div className="sidebar-index-item">Projects ({parsedProfile.projects?.length || 0})</div>
                    </>
                );
            case 'technical':
                return technicalQuestions.length === 0
                    ? <p className="sidebar-empty">No technical questions</p>
                    : technicalQuestions.map((q, i) => (
                        <div key={i} className="sidebar-index-item" title={q.question}>
                            Q{i + 1}. {q.question.length > 38 ? q.question.substring(0, 38) + '…' : q.question}
                        </div>
                    ));
            case 'behavioral':
                return behavioralQuestions.length === 0
                    ? <p className="sidebar-empty">No behavioral questions</p>
                    : behavioralQuestions.map((q, i) => (
                        <div key={i} className="sidebar-index-item" title={q.question}>
                            Q{i + 1}. {q.question.length > 38 ? q.question.substring(0, 38) + '…' : q.question}
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
        const currentSec = SECTIONS.find(s => s.id === activeSection);
        const Icon = currentSec?.icon;

        switch (activeSection) {
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

                        {/* Detailed Score Breakdown */}
                        <div className="breakdown-section">
                            <h3 className="section-subtitle">
                                <TrendingUp size={16} /> Dimensional Match Breakdown
                            </h3>
                            <div className="breakdown-grid">
                                <ProgressBar
                                    label="Technical & Hard Skills"
                                    score={scoreBreakdown.skillsScore ?? Math.min(matchScore + 4, 100)}
                                    color="var(--accent)"
                                />
                                <ProgressBar
                                    label="Experience & Seniority Fit"
                                    score={scoreBreakdown.experienceScore ?? matchScore}
                                    color="var(--success)"
                                />
                                <ProgressBar
                                    label="Education & Qualifications"
                                    score={scoreBreakdown.educationScore ?? Math.min(matchScore + 8, 100)}
                                    color="var(--violet)"
                                />
                                <ProgressBar
                                    label="Core Responsibilities Match"
                                    score={scoreBreakdown.responsibilitiesScore ?? Math.max(matchScore - 5, 40)}
                                    color="var(--warning)"
                                />
                                <ProgressBar
                                    label="ATS Parsability & Structure"
                                    score={scoreBreakdown.atsFormattingScore ?? 92}
                                    color="#38BDF8"
                                />
                            </div>
                        </div>

                        {/* Strengths & Weaknesses 2-Column */}
                        <div className="sw-grid">
                            <div className="sw-card sw-card--strengths">
                                <h4><CheckCircle2 size={16} /> Competitive Strengths</h4>
                                <ul>
                                    {strengths.length > 0 ? strengths.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    )) : (
                                        <li>Strong alignment with role expectations and core domain.</li>
                                    )}
                                </ul>
                            </div>
                            <div className="sw-card sw-card--weaknesses">
                                <h4><XCircle size={16} /> Key Potential Risks / Probing Areas</h4>
                                <ul>
                                    {weaknesses.length > 0 ? weaknesses.map((w, i) => (
                                        <li key={i}>{w}</li>
                                    )) : (
                                        <li>Candidate should be prepared to discuss specific metrics on past projects.</li>
                                    )}
                                </ul>
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
                                                <span className="bullet-tag bullet-tag--orig">Original</span>
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
                        {/* Header profile card */}
                        <div className="parsed-header-card">
                            <div className="parsed-avatar">
                                <User size={24} />
                            </div>
                            <div className="parsed-header-info">
                                <h2>{parsedProfile.fullName || 'Candidate Resume'}</h2>
                                <div className="parsed-contact-row">
                                    {parsedProfile.email && (
                                        <span><Mail size={13} /> {parsedProfile.email}</span>
                                    )}
                                    {parsedProfile.phone && (
                                        <span><Phone size={13} /> {parsedProfile.phone}</span>
                                    )}
                                    {parsedProfile.location && (
                                        <span><MapPin size={13} /> {parsedProfile.location}</span>
                                    )}
                                    {parsedProfile.linkedin && (
                                        <span><Linkedin size={13} /> LinkedIn</span>
                                    )}
                                    {parsedProfile.github && (
                                        <span><Github size={13} /> GitHub/Portfolio</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        {parsedProfile.summary && (
                            <div className="parsed-section">
                                <h3 className="parsed-section-title"><User size={15} /> Professional Summary</h3>
                                <p className="parsed-summary-text">{parsedProfile.summary}</p>
                            </div>
                        )}

                        {/* Extracted Skills Categorized */}
                        <div className="parsed-section">
                            <h3 className="parsed-section-title"><Code size={15} /> Extracted Skills Inventory</h3>
                            <div className="parsed-skills-grid">
                                {parsedProfile.hardSkills?.length > 0 && (
                                    <div className="psg-block">
                                        <h4>Hard & Technical Skills</h4>
                                        <div className="psg-tags">
                                            {parsedProfile.hardSkills.map((s, i) => (
                                                <span key={i} className="psg-tag">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {parsedProfile.toolsAndFrameworks?.length > 0 && (
                                    <div className="psg-block">
                                        <h4>Frameworks, Tools & Cloud</h4>
                                        <div className="psg-tags">
                                            {parsedProfile.toolsAndFrameworks.map((t, i) => (
                                                <span key={i} className="psg-tag psg-tag--tool">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {parsedProfile.softSkills?.length > 0 && (
                                    <div className="psg-block">
                                        <h4>Soft Skills & Leadership</h4>
                                        <div className="psg-tags">
                                            {parsedProfile.softSkills.map((s, i) => (
                                                <span key={i} className="psg-tag psg-tag--soft">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Experience */}
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

                        {/* Education */}
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
                            <p>Questions tailored to evaluate the candidate's depth in critical JD skill requirements.</p>
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
                            <p>Situational and cultural questions structured to practice the STAR methodology.</p>
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
                                <p>Candidate resume fully matches all stated core skills in the job description.</p>
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
                                                    <strong>💡 Action Plan:</strong> {gap.recommendation}
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
                    <span>{jobRole}</span> · ATS Evaluation & Interview Suite
                </div>
                <div className="result-nav-right">
                    <ThemeToggle />
                    <Button variant="secondary" size="sm" onClick={logout}>Logout</Button>
                </div>
            </header>

            {/* ── 3-Column Layout ── */}
            <div className="result-3col">
                {/* ── LEFT: TOC / Index ── */}
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

                {/* ── RIGHT: Score + Section Selector + Action ── */}
                <aside className="result-col-right">
                    {/* Score Card */}
                    <div className="score-card">
                        <div className="score-card-grid">
                            {/* Score Ring */}
                            <div className="sc-ring-box">
                                <ScoreRing score={matchScore} />
                            </div>

                            {/* Stats */}
                            <div className="sc-stats-box">
                                <div className="sc-stat">
                                    <span className="sc-stat-value">{matchedKeywords.length} / {totalKeywords || 10}</span>
                                    <span className="sc-stat-label">Keywords</span>
                                </div>
                                <div className="sc-stat">
                                    <span className="sc-stat-value">{technicalQuestions.length}</span>
                                    <span className="sc-stat-label">Tech Qs</span>
                                </div>
                                <div className="sc-stat">
                                    <span className="sc-stat-value">{behavioralQuestions.length}</span>
                                    <span className="sc-stat-label">Behavioral</span>
                                </div>
                                <div className="sc-stat">
                                    <span className="sc-stat-value">{skillGaps.length}</span>
                                    <span className="sc-stat-label">Gaps</span>
                                </div>
                            </div>

                            {/* Title banner */}
                            <div className="sc-title-box">
                                <h3>{jobRole}</h3>
                                <p>ATS-grade match comparison & interview readiness analysis</p>
                            </div>
                        </div>
                    </div>

                    {/* Section Selector Buttons */}
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
