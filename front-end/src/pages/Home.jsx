import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { LogOut, Send, User, Briefcase, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import FileUpload from '../components/ui/FileUpload';
import ThemeToggle from '../components/ui/ThemeToggle';
import DocumentLoader from '../components/ui/DocumentLoader';
import { interviewService } from '../services/interview.service';
import './Home.scss';

const Home = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // ── Auth guard: redirect unauthenticated users ─────────────────────────────
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    const [resumeFile, setResumeFile]         = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [selfDescription, setSelfDescription] = useState('');
    const [submitting, setSubmitting]         = useState(false);
    const [errors, setErrors]                 = useState({});
    const [apiError, setApiError]             = useState('');
    const [pastReports, setPastReports]       = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await interviewService.getMyReports();
                setPastReports(data.reports || []);
            } catch (error) {
                console.error('Failed to fetch past reports', error);
            } finally {
                setLoadingReports(false);
            }
        };
        fetchReports();
    }, []);

    const validate = () => {
        const e = {};
        if (!resumeFile)         e.resume       = 'Please upload your resume PDF.';
        if (!jobDescription.trim()) e.jobDescription  = 'Job description is required.';
        if (!selfDescription.trim()) e.selfDescription = 'Please write a brief self description.';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setErrors({});
        setApiError('');
        setSubmitting(true);

        try {
            const data = await interviewService.submitInterview({
                resume: resumeFile,
                jobDescription,
                selfDescription,
            });
            // data = { success, message, report: { matchScore, technicalQuestions, ... } }
            navigate('/result', { state: { report: data.report } });

        } catch (err) {
            setApiError(err.response?.data?.message || 'Failed to generate report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const clearFieldError = (field) => {
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <div className="home-layout">
            {/* ── Navbar ── */}
            <header className="home-nav glass-panel">
                <div className="home-nav-brand">
                    <span className="home-nav-title">ResuMe AI</span>
                </div>

                <div className="home-nav-right">
                    <div className="home-nav-user">
                        <div className="home-nav-avatar">
                            <User size={16} />
                        </div>
                        <span className="home-nav-username">{user?.username}</span>
                    </div>
                    <ThemeToggle />
                    <Button variant="secondary" size="sm" onClick={logout}>
                        <LogOut size={14} />
                        Logout
                    </Button>
                </div>
            </header>

            {/* ── Main Form ── */}
            <main className="home-main">
                {/* API-level error toast */}
                {apiError && (
                    <div className="home-api-error" role="alert">
                        <span>⚠</span>
                        <span>{apiError}</span>
                        <button onClick={() => setApiError('')}>✕</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="home-grid" noValidate>
                    {/* ── LEFT COLUMN — Job Description ── */}
                    <div className="home-col-left">
                        <div className="home-card glass-panel">
                            <div className="home-card-header">
                                <div className="home-card-icon home-card-icon--violet">
                                    <Briefcase size={18} />
                                </div>
                                <div>
                                    <h3 className="home-card-title">Job Description</h3>
                                    <p className="home-card-subtitle">Paste the full job posting you're targeting</p>
                                </div>
                            </div>

                            <div className="home-card-body">
                                <Input
                                    id="jobDescription"
                                    multiline
                                    rows={16}
                                    placeholder="Paste the job description here...&#10;&#10;Include responsibilities, requirements, and any key skills the role expects."
                                    value={jobDescription}
                                    onChange={(e) => {
                                        setJobDescription(e.target.value);
                                        clearFieldError('jobDescription');
                                    }}
                                    error={errors.jobDescription}
                                />
                            </div>

                            <div className="home-card-footer">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    isLoading={submitting}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>Generating Report…</>
                                    ) : (
                                        <><Send size={16} /> Generate AI Report</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="home-col-right">
                        {/* Upload Resume Card */}
                        <div className="home-card glass-panel">
                            <div className="home-card-header">
                                <div className="home-card-icon home-card-icon--emerald">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3 className="home-card-title">Upload Resume</h3>
                                    <p className="home-card-subtitle">PDF format only</p>
                                </div>
                            </div>
                            <div className="home-card-body">
                                <FileUpload
                                    value={resumeFile}
                                    onChange={(file) => {
                                        setResumeFile(file);
                                        clearFieldError('resume');
                                    }}
                                    error={errors.resume}
                                />
                            </div>
                        </div>

                        {/* Self Description Card */}
                        <div className="home-card glass-panel">
                            <div className="home-card-header">
                                <div className="home-card-icon home-card-icon--amber">
                                    <User size={18} />
                                </div>
                                <div>
                                    <h3 className="home-card-title">Self Description</h3>
                                    <p className="home-card-subtitle">Tell us about yourself</p>
                                </div>
                            </div>
                            <div className="home-card-body">
                                <Input
                                    id="selfDescription"
                                    multiline
                                    rows={7}
                                    placeholder="Write a brief description about yourself...&#10;&#10;Your experience, key strengths, and what kind of role you're looking for."
                                    value={selfDescription}
                                    onChange={(e) => {
                                        setSelfDescription(e.target.value);
                                        clearFieldError('selfDescription');
                                    }}
                                    error={errors.selfDescription}
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* ── Past Reports Section ── */}
                <section className="home-reports-section mt-12">
                    <div className="home-reports-header">
                        <h2 className="home-reports-title">Your Past Reports</h2>
                    </div>

                    {loadingReports ? (
                        <div className="home-reports-loading">Loading reports...</div>
                    ) : pastReports.length === 0 ? (
                        <div className="home-reports-empty glass-panel">
                            <FileText size={24} />
                            <p>You haven't generated any reports yet.</p>
                        </div>
                    ) : (
                        <div className="home-reports-grid">
                            {pastReports.map((report) => (
                                <div 
                                    key={report._id} 
                                    className="home-report-card glass-panel"
                                    onClick={() => navigate('/result', { state: { report } })}
                                >
                                    <div className="home-report-card-top">
                                        <div className="hrc-score">
                                            <span className="hrc-score-val">{report.matchScore}%</span>
                                            <span className="hrc-score-label">MATCH</span>
                                        </div>
                                        <div className="hrc-date">
                                            {new Date(report.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <div className="hrc-job-role" title={report.jobRole || "Interview Report"}>
                                        {report.jobRole || "Interview Report"}
                                    </div>
                                    <div className="hrc-stats">
                                        <div className="hrc-stat"><span>{report.technicalQuestions?.length || 0}</span> Tech Qs</div>
                                        <div className="hrc-stat"><span>{report.behavioralQuestions?.length || 0}</span> Behav Qs</div>
                                        <div className="hrc-stat"><span>{report.skillGaps?.length || 0}</span> Gaps</div>
                                    </div>
                                    <div className="hrc-action">View Report →</div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Loading overlay */}
                {submitting && (
                    <div className="home-loading-overlay">
                        <DocumentLoader />
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
