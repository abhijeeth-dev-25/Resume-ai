import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
    ArrowLeft, Target, Zap, AlertTriangle, Calendar,
    ChevronDown, ChevronUp, Sparkles, Loader2
} from 'lucide-react';
import { interviewService } from '../services/interview.service';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import './Result.scss';

// ── Score ring ─────────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
    const r = 38;
    const circ = 2 * Math.PI * r;
    const fill = circ - (score / 100) * circ;
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
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                />
            </svg>
            <div className="score-ring-inner">
                <span className="score-ring-value" style={{ color }}>{score}%</span>
                <span className="score-ring-label">Match</span>
            </div>
        </div>
    );
};

// ── Accordion item ─────────────────────────────────────────────────────────────
const AccordionItem = ({ title, intention, answer, index }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={`accordion-item ${open ? 'accordion-item--open' : ''}`}>
            <button className="accordion-header" onClick={() => setOpen(!open)} type="button">
                <span className="accordion-index">Q{index + 1}</span>
                <span className="accordion-question">{title}</span>
                <span className="accordion-chevron">
                    {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
            </button>
            {open && (
                <div className="accordion-body">
                    {intention && (
                        <p className="accordion-intention">
                            <strong>💡 Intent:</strong> {intention}
                        </p>
                    )}
                    <p className="accordion-answer">{answer}</p>
                </div>
            )}
        </div>
    );
};

// ── Section definitions ────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'technical',    label: 'Technical Questions',  icon: Zap },
    { id: 'skill',        label: 'Skill Gaps',            icon: AlertTriangle },
    { id: 'preparation',  label: 'Preparation Plan',      icon: Calendar },
    { id: 'behavioral',   label: 'Behavioral Questions', icon: Target },
];

// ── Result Page ────────────────────────────────────────────────────────────────
const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [activeSection, setActiveSection] = useState('preparation');
    const [downloading, setDownloading] = useState(false);

    const report = location.state?.report;

    const handleDownloadResume = async () => {
        if (!report?._id || downloading) return;

        try {
            setDownloading(true);
            const blob = await interviewService.downloadResume(report._id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Resume_${report._id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download resume. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (!report) {
        return (
            <div className="result-layout">
                <div className="result-empty">
                    <p>No report found.</p>
                    <Button variant="primary" onClick={() => navigate('/')}>Go Home</Button>
                </div>
            </div>
        );
    }

    const {
        matchScore = 0,
        technicalQuestions = [],
        behavioralQuestions = [],
        skillGaps = [],
        preparationPlan = [],
    } = report;

    // ── Left sidebar TOC content based on active section ──────────────────────
    const renderSidebarIndex = () => {
        switch (activeSection) {
            case 'technical':
                return technicalQuestions.length === 0
                    ? <p className="sidebar-empty">No questions yet</p>
                    : technicalQuestions.map((q, i) => (
                        <div key={i} className="sidebar-index-item">Q{i + 1}. {q.question}</div>
                    ));
            case 'behavioral':
                return behavioralQuestions.length === 0
                    ? <p className="sidebar-empty">No questions yet</p>
                    : behavioralQuestions.map((q, i) => (
                        <div key={i} className="sidebar-index-item">Q{i + 1}. {q.question}</div>
                    ));
            case 'skill':
                return skillGaps.length === 0
                    ? <p className="sidebar-empty">All skills match!</p>
                    : skillGaps.map((gap, i) => (
                        <div key={i} className="sidebar-index-item">{gap.skill}</div>
                    ));
            case 'preparation':
            default:
                return preparationPlan.length === 0
                    ? <p className="sidebar-empty">No plan yet</p>
                    : preparationPlan.map((day, i) => (
                        <div key={i} className="sidebar-index-item">
                            Day {day.day} — {day.focus}
                        </div>
                    ));
        }
    };

    // ── Center panel content ───────────────────────────────────────────────────
    const renderCenterContent = () => {
        const section = SECTIONS.find(s => s.id === activeSection);
        const Icon = section?.icon;

        switch (activeSection) {
            case 'technical':
                return (
                    <>
                        <div className="center-header">
                            {Icon && <Icon size={18} />}
                            <h2>Technical Questions</h2>
                        </div>
                        <div className="center-body">
                            {technicalQuestions.length === 0
                                ? <p className="result-empty-text">No technical questions generated.</p>
                                : technicalQuestions.map((q, i) => (
                                    <AccordionItem key={i} index={i} title={q.question} intention={q.intention} answer={q.answer} />
                                ))}
                        </div>
                    </>
                );
            case 'behavioral':
                return (
                    <>
                        <div className="center-header">
                            {Icon && <Icon size={18} />}
                            <h2>Behavioral Questions</h2>
                        </div>
                        <div className="center-body">
                            {behavioralQuestions.length === 0
                                ? <p className="result-empty-text">No behavioral questions generated.</p>
                                : behavioralQuestions.map((q, i) => (
                                    <AccordionItem key={i} index={i} title={q.question} intention={q.intention} answer={q.answer} />
                                ))}
                        </div>
                    </>
                );
            case 'skill':
                return (
                    <>
                        <div className="center-header">
                            {Icon && <Icon size={18} />}
                            <h2>Skill Gaps</h2>
                        </div>
                        <div className="center-body">
                            {skillGaps.length === 0
                                ? <p className="result-empty-text">All skills match!</p>
                                : <div className="skill-gaps-list">
                                    {skillGaps.map((gap, i) => {
                                        const cfg = {
                                            high:   { label: 'High',   cls: 'badge-high' },
                                            medium: { label: 'Medium', cls: 'badge-medium' },
                                            low:    { label: 'Low',    cls: 'badge-low' },
                                        }[gap.severity] || { label: 'Low', cls: 'badge-low' };
                                        return (
                                            <div key={i} className="skill-gap-item">
                                                <span className="skill-gap-name">{gap.skill}</span>
                                                <span className={`skill-gap-badge ${cfg.cls}`}>{cfg.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            }
                        </div>
                    </>
                );
            case 'preparation':
            default:
                return (
                    <>
                        <div className="center-header">
                            {Icon && <Icon size={18} />}
                            <h2>Preparation Plan</h2>
                        </div>
                        <div className="center-body">
                            {preparationPlan.length === 0
                                ? <p className="result-empty-text">No preparation plan generated.</p>
                                : <div className="timeline">
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
                            }
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="result-layout">

            {/* ── Navbar ── */}
            <header className="result-nav glass-panel">
                <button className="result-nav-back" onClick={() => navigate('/')} type="button">
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
                <span className="result-nav-title">Interview Report</span>
                <div className="result-nav-right">
                    <ThemeToggle />
                    <Button variant="secondary" size="sm" onClick={logout}>Logout</Button>
                </div>
            </header>

            {/* ── 3-column body ── */}
            <div className="result-3col">

                {/* ── LEFT: TOC / index ── */}
                <aside className="result-col-left">
                    <div className="sidebar-title-card">
                        <h2>{SECTIONS.find(s => s.id === activeSection)?.label}</h2>
                    </div>
                    <div className="sidebar-index">
                        {renderSidebarIndex()}
                    </div>
                </aside>

                {/* ── CENTER: main detail panel ── */}
                <main className="result-col-center glass-panel">
                    {renderCenterContent()}
                </main>

                {/* ── RIGHT: score + nav ── */}
                <aside className="result-col-right">
                    {/* Score card — 2-column grid */}
                    <div className="score-card glass-panel">
                        <div className="score-card-grid">

                            {/* Top-left: Ring */}
                            <div className="sc-ring-box">
                                <ScoreRing score={matchScore} />
                            </div>

                            {/* Top-right: Stats stacked */}
                            <div className="sc-stats-box">
                                <div className="sc-stat">
                                    <span className="sc-stat-value">{technicalQuestions.length}</span>
                                    <span className="sc-stat-label">Technical Qs</span>
                                </div>
                                <div className="sc-stat">
                                    <span className="sc-stat-value">{behavioralQuestions.length}</span>
                                    <span className="sc-stat-label">Behavioral Qs</span>
                                </div>
                                <div className="sc-stat">
                                    <span className="sc-stat-value">{skillGaps.length}</span>
                                    <span className="sc-stat-label">Skill Gaps</span>
                                </div>
                                <div className="sc-stat">
                                    <span className="sc-stat-value">{preparationPlan.length}</span>
                                    <span className="sc-stat-label">Plan Days</span>
                                </div>
                            </div>

                            {/* Bottom-left: Title + description */}
                            <div className="sc-title-box">
                                <h3>Your Interview Report</h3>
                                <p>AI-powered analysis of your resume against the job description</p>
                            </div>

                        </div>
                    </div>

                    {/* Section nav buttons */}
                    <div className="section-nav">
                        {/* Row 1: two side-by-side */}
                        <div className="section-nav-row">
                            <button
                                type="button"
                                className={`section-nav-btn ${activeSection === 'technical' ? 'section-nav-btn--active' : ''}`}
                                onClick={() => setActiveSection('technical')}
                            >
                                Technical Questions
                            </button>
                            <button
                                type="button"
                                className={`section-nav-btn ${activeSection === 'skill' ? 'section-nav-btn--active' : ''}`}
                                onClick={() => setActiveSection('skill')}
                            >
                                Skill Gaps
                            </button>
                        </div>
                        {/* Row 2: full-width */}
                        <button
                            type="button"
                            className={`section-nav-btn section-nav-btn--full ${activeSection === 'preparation' ? 'section-nav-btn--active' : ''}`}
                            onClick={() => setActiveSection('preparation')}
                        >
                            Preparation Plan
                        </button>
                        {/* Row 3: full-width */}
                        <button
                            type="button"
                            className={`section-nav-btn section-nav-btn--full ${activeSection === 'behavioral' ? 'section-nav-btn--active' : ''}`}
                            onClick={() => setActiveSection('behavioral')}
                        >
                            Behavioral Questions
                        </button>
                    </div>

                    {/* Download Button */}
                    <button 
                        className={`download-btn ${downloading ? 'download-btn--loading' : ''}`}
                        onClick={handleDownloadResume}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <>
                                <div className="download-btn-shimmer"></div>
                                <Loader2 size={18} className="animate-spin" />
                                <span>GENERATING PDF...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                <span>DOWNLOAD AI RESUME</span>
                            </>
                        )}
                    </button>
                </aside>
            </div>
        </div>
    );
};

export default Result;
