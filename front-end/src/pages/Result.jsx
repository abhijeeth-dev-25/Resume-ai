import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
    ArrowLeft, Target, Zap, AlertTriangle, Calendar,
    ChevronDown, ChevronUp, Sparkles, Loader2,
    BarChart3, Tags, FileText, CheckCircle2, XCircle,
    Award, Briefcase, GraduationCap, Code,
    User, Mail, Phone, MapPin, Linkedin, Github,
    Check, ArrowRight, TrendingUp, ShieldCheck,
    Cpu, Compass, UserCheck, Flame, Layers, ExternalLink,
    Filter, HelpCircle, ArrowUpRight, CheckSquare, PlusCircle,
    BookOpen, Terminal, Brain, Calculator, Building2, Download
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
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--border-color)"
                        strokeWidth={strokeWidth}
                        className="circle-track"
                    />
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
const AccordionItem = ({ title, intention, answer, index, tag }) => {
    const [open, setOpen] = useState(index === 0);
    return (
        <div className={`accordion-item ${open ? 'accordion-item--open' : ''}`}>
            <button className="accordion-header" onClick={() => setOpen(!open)} type="button">
                <span className="accordion-index">Q{index + 1}</span>
                <div className="accordion-q-wrapper">
                    <span className="accordion-question">{title}</span>
                    {tag && <span className="accordion-tag">{tag}</span>}
                </div>
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

// ── Curated LeetCode DSA Database ─────────────────────────────────────────────
const CURATED_DSA_PROBLEMS = [
    {
        id: 1,
        title: "LRU Cache (Least Recently Used)",
        difficulty: "Medium",
        pattern: "Hash Map + Doubly Linked List",
        leetcodeUrl: "https://leetcode.com/problems/lru-cache/",
        timeComplexity: "O(1) Get / Put",
        spaceComplexity: "O(Capacity)",
        approach: "Use a Hash Map for O(1) key lookups mapping to Doubly Linked List nodes. On access or insertion, move node to head (most recent). When capacity is exceeded, evict the tail node."
    },
    {
        id: 2,
        title: "Top K Frequent Elements",
        difficulty: "Medium",
        pattern: "Min-Heap / Bucket Sort",
        leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
        timeComplexity: "O(N log K) Time",
        spaceComplexity: "O(N) Space",
        approach: "Count frequencies with a Hash Map. Maintain a Min-Heap of size K. If heap size exceeds K, pop min frequency. Alternatively, use Bucket Sort with frequency as indices for O(N) linear time."
    },
    {
        id: 3,
        title: "Course Schedule (Cycle Detection)",
        difficulty: "Medium",
        pattern: "Graph BFS / Kahn's Algorithm",
        leetcodeUrl: "https://leetcode.com/problems/course-schedule/",
        timeComplexity: "O(V + E) Time",
        spaceComplexity: "O(V + E) Space",
        approach: "Build an adjacency list and in-degree array. Push all nodes with in-degree 0 into a Queue. Repeatedly dequeue, reduce neighbors' in-degrees, and enqueue new 0 in-degree nodes. If processed count == total courses, graph is a valid DAG."
    },
    {
        id: 4,
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        pattern: "Sliding Window + Hash Set",
        leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        timeComplexity: "O(N) Time",
        spaceComplexity: "O(min(N, Alphabet))",
        approach: "Maintain two pointers (left, right) and a character frequency map. Expand right pointer until a duplicate is encountered, then shrink from left until the duplicate is removed, updating max length."
    },
    {
        id: 5,
        title: "Design Search Autocomplete System",
        difficulty: "Hard",
        pattern: "Trie + Priority Queue / Min-Heap",
        leetcodeUrl: "https://leetcode.com/problems/design-search-autocomplete-system/",
        timeComplexity: "O(K) Query",
        spaceComplexity: "O(Alphabet * Total Nodes)",
        approach: "Implement a Prefix Trie where each TrieNode stores the top 3 historical sentences and frequencies. On typing character, traverse TrieNode in O(1) and return pre-sorted top 3 suggestions."
    },
    {
        id: 6,
        title: "Trapping Rain Water",
        difficulty: "Hard",
        pattern: "Two Pointers / Monotonic Stack",
        leetcodeUrl: "https://leetcode.com/problems/trapping-rain-water/",
        timeComplexity: "O(N) Time",
        spaceComplexity: "O(1) Space",
        approach: "Use two pointers left and right with leftMax and rightMax variables. Move whichever pointer has the lower boundary, adding max(0, boundary - currentHeight) to total trapped water."
    }
];

// ── Curated Aptitude & CS Fundamentals ────────────────────────────────────────
const APTITUDE_AND_LOGIC = [
    {
        id: 1,
        category: "Quantitative Reasoning",
        question: "A service processes 1,800 requests per minute with an average response time of 200ms. According to Little's Law (L = λ * W), what is the average number of concurrent requests in the system?",
        formula: "L = λ (Arrival Rate) * W (Average Latency)",
        solution: "1. Convert arrival rate to seconds: 1,800 req/min ÷ 60 = 30 req/sec (λ).\n2. Convert latency to seconds: 200ms = 0.2 sec (W).\n3. L = 30 * 0.2 = 6 concurrent in-flight requests on average."
    },
    {
        id: 2,
        category: "Data Integrity & Hashing",
        question: "In a distributed system with 4 cache nodes, standard modulo hashing causes ~75% key remappings when 1 node crashes. How does Consistent Hashing solve this?",
        formula: "Consistent Hashing Ring with Virtual Nodes",
        solution: "Keys and nodes are mapped onto a 2^32-1 circular hash ring. When a node is added or removed, only K/N keys (where K is total keys and N is nodes) need relocation to the immediate successor node, eliminating massive cache stampedes."
    },
    {
        id: 3,
        category: "Operating Systems & Concurrency",
        question: "Explain the four necessary conditions for Deadlock (Coffman Conditions) and how to prevent them in backend code.",
        formula: "1. Mutual Exclusion  2. Hold & Wait  3. No Preemption  4. Circular Wait",
        solution: "To prevent deadlocks: (1) Impose a strict global lock acquisition hierarchy (eliminates Circular Wait), (2) Use timeouts on lock acquisition (e.g. Redis Redlock with TTL), (3) Allocate all required resources upfront."
    }
];

// ── Navigation Sections ────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'overview',     label: 'Persona & Fit Overview', icon: UserCheck },
    { id: 'match',        label: 'Circle Graphs & Scores', icon: BarChart3 },
    { id: 'keywords',     label: 'ATS Keyword Matrix',     icon: Tags },
    { id: 'parsed',       label: 'Parsed Resume Dossier',  icon: FileText },
    { id: 'rounds',       label: 'Company Hiring Rounds',  icon: Building2 },
    { id: 'dsa',          label: 'LeetCode & DSA Suite',   icon: Terminal },
    { id: 'technical',    label: 'Technical Q&A Suite',    icon: Zap },
    { id: 'behavioral',   label: 'Behavioral STAR Suite',  icon: Target },
    { id: 'aptitude',     label: 'Aptitude & CS Basics',   icon: Brain },
    { id: 'skill',        label: 'Skill Gaps & Action',    icon: AlertTriangle },
    { id: 'preparation',  label: '7-Day Study Roadmap',    icon: Calendar },
];

// ── Result Page Component ──────────────────────────────────────────────────────
const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [activeSection, setActiveSection] = useState('overview');
    const [downloadingResume, setDownloadingResume] = useState(false);
    const [downloadingPrepGuide, setDownloadingPrepGuide] = useState(false);
    const [keywordCategoryFilter, setKeywordCategoryFilter] = useState('ALL');
    const [dsaDifficultyFilter, setDsaDifficultyFilter] = useState('ALL');
    const [completedTasks, setCompletedTasks] = useState({});

    const report = location.state?.report;

    const toggleTask = (dayIndex, taskIndex) => {
        const key = `${dayIndex}-${taskIndex}`;
        setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Download Tailored Resume PDF
    const handleDownloadResume = async () => {
        if (!report?._id || downloadingResume) return;

        try {
            setDownloadingResume(true);
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
            setDownloadingResume(false);
        }
    };

    // Download Master Preparation Guide PDF
    const handleDownloadPrepGuide = async () => {
        if (!report?._id || downloadingPrepGuide) return;

        try {
            setDownloadingPrepGuide(true);
            const blob = await interviewService.downloadPrepGuide(report._id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Master_Prep_Guide_${report.jobRole ? report.jobRole.replace(/\s+/g, '_') : 'Interview'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download guide failed:', error);
            alert('Failed to download Master Preparation Guide. Please try again.');
        } finally {
            setDownloadingPrepGuide(false);
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

    const totalExperienceRoles = parsedProfile.experience?.length || 1;
    const candidateSkills = parsedProfile.hardSkills || matchedKeywords.map(k => typeof k === 'string' ? k : k.keyword);
    const candidateTools = parsedProfile.toolsAndFrameworks || [];

    // Extract unique categories for keyword filter
    const keywordCategories = useMemo(() => {
        const cats = new Set();
        matchedKeywords.forEach(k => k.category && cats.add(k.category));
        missingKeywords.forEach(k => k.category && cats.add(k.category));
        return ['ALL', ...Array.from(cats)];
    }, [matchedKeywords, missingKeywords]);

    const filteredMatchedKeywords = useMemo(() => {
        if (keywordCategoryFilter === 'ALL') return matchedKeywords;
        return matchedKeywords.filter(k => k.category === keywordCategoryFilter);
    }, [matchedKeywords, keywordCategoryFilter]);

    const filteredMissingKeywords = useMemo(() => {
        if (keywordCategoryFilter === 'ALL') return missingKeywords;
        return missingKeywords.filter(k => k.category === keywordCategoryFilter);
    }, [missingKeywords, keywordCategoryFilter]);

    const filteredDsaProblems = useMemo(() => {
        if (dsaDifficultyFilter === 'ALL') return CURATED_DSA_PROBLEMS;
        return CURATED_DSA_PROBLEMS.filter(p => p.difficulty.toUpperCase() === dsaDifficultyFilter.toUpperCase());
    }, [dsaDifficultyFilter]);

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
            case 'rounds':
                return (
                    <>
                        <div className="sidebar-index-item">Round 1: Screening & OA</div>
                        <div className="sidebar-index-item">Round 2: Technical Deep Dive</div>
                        <div className="sidebar-index-item">Round 3: System Architecture</div>
                        <div className="sidebar-index-item">Round 4: Behavioral & STAR</div>
                    </>
                );
            case 'dsa':
                return (
                    <>
                        <div className="sidebar-index-item">LRU Cache (Hash Map + DLL)</div>
                        <div className="sidebar-index-item">Top K Frequent (Min-Heap)</div>
                        <div className="sidebar-index-item">Course Schedule (Graph BFS)</div>
                        <div className="sidebar-index-item">Longest Substring (Sliding Window)</div>
                        <div className="sidebar-index-item">Autocomplete System (Trie)</div>
                    </>
                );
            case 'aptitude':
                return (
                    <>
                        <div className="sidebar-index-item">Quantitative: Little's Law & Concurrency</div>
                        <div className="sidebar-index-item">Distributed: Consistent Hashing</div>
                        <div className="sidebar-index-item">OS: Coffman Deadlock Conditions</div>
                    </>
                );
            case 'match':
                return (
                    <>
                        <div className="sidebar-index-item">Overall Match: {matchScore}%</div>
                        <div className="sidebar-index-item">Technical Skills: {scoreBreakdown.skillsScore ?? matchScore}%</div>
                        <div className="sidebar-index-item">Experience Fit: {scoreBreakdown.experienceScore ?? matchScore}%</div>
                        <div className="sidebar-index-item">Education Fit: {scoreBreakdown.educationScore ?? 92}%</div>
                        <div className="sidebar-index-item">ATS Parsability: {scoreBreakdown.atsFormattingScore ?? 90}%</div>
                    </>
                );
            case 'keywords':
                return (
                    <>
                        <div className="sidebar-index-item">Matched Skills ({matchedKeywords.length})</div>
                        <div className="sidebar-index-item">Missing Keywords ({missingKeywords.length})</div>
                        <div className="sidebar-index-item">Keyword Coverage: {keywordCoverage}%</div>
                        <div className="sidebar-index-item">Categories ({keywordCategories.length - 1})</div>
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

            case 'rounds':
                return (
                    <div className="rounds-view">
                        <div className="view-intro">
                            <p>Standard 4-Stage Interview Process for <strong>{jobRole}</strong> positions at top-tier technology organizations.</p>
                        </div>

                        <div className="rounds-grid">
                            <div className="round-card">
                                <div className="rc-header">
                                    <span className="rc-step">STAGE 1</span>
                                    <span className="rc-duration">45 – 60 Mins</span>
                                </div>
                                <h3 className="rc-title">Online Assessment & Screening</h3>
                                <p className="rc-desc">Automated coding test focusing on Data Structures & Algorithms, quantitative aptitude, and core computer science fundamentals.</p>
                                <div className="rc-focus">
                                    <strong>🎯 Key Evaluation Areas:</strong>
                                    <ul>
                                        <li>2 LeetCode Medium DSA problems (Strings, Arrays, HashMaps).</li>
                                        <li>15 Multiple choice CS fundamentals (OS, Networks, DB Indexing).</li>
                                        <li>Code cleaniness, time & space complexity edge cases.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="round-card">
                                <div className="rc-header">
                                    <span className="rc-step">STAGE 2</span>
                                    <span className="rc-duration">60 Mins</span>
                                </div>
                                <h3 className="rc-title">Technical Deep Dive & Live Coding</h3>
                                <p className="rc-desc">1-on-1 collaborative coding session with a Senior Engineer evaluating real-time problem-solving, debugging, and framework internals.</p>
                                <div className="rc-focus">
                                    <strong>🎯 Key Evaluation Areas:</strong>
                                    <ul>
                                        <li>Node.js / React asynchronous patterns & event loop concurrency.</li>
                                        <li>Live problem refactoring and modular code design.</li>
                                        <li>Handling edge cases, error boundaries, and rate limits.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="round-card">
                                <div className="rc-header">
                                    <span className="rc-step">STAGE 3</span>
                                    <span className="rc-duration">60 Mins</span>
                                </div>
                                <h3 className="rc-title">System Architecture & Design</h3>
                                <p className="rc-desc">High-level architecture interview with a Staff/Principal Engineer designing scalable, distributed, low-latency microservices.</p>
                                <div className="rc-focus">
                                    <strong>🎯 Key Evaluation Areas:</strong>
                                    <ul>
                                        <li>Designing end-to-end RAG pipelines and AI agent state flows.</li>
                                        <li>Database schema, indexing, Redis caching, and sharding strategies.</li>
                                        <li>Failure modes, circuit breakers, and horizontal auto-scaling.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="round-card">
                                <div className="rc-header">
                                    <span className="rc-step">STAGE 4</span>
                                    <span className="rc-duration">45 Mins</span>
                                </div>
                                <h3 className="rc-title">Executive & Behavioral STAR</h3>
                                <p className="rc-desc">Interview with the Engineering Manager / Director evaluating culture alignment, conflict resolution, and leadership velocity.</p>
                                <div className="rc-focus">
                                    <strong>🎯 Key Evaluation Areas:</strong>
                                    <ul>
                                        <li>Past production incidents and root-cause post-mortems.</li>
                                        <li>Navigating tight sprint deadlines and technical debt.</li>
                                        <li>Mentoring peers and cross-functional stakeholder alignment.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'dsa':
                return (
                    <div className="dsa-view">
                        <div className="view-intro">
                            <p>Hand-curated algorithmic coding challenges frequently tested for <strong>{jobRole}</strong> interviews.</p>
                        </div>

                        {/* Difficulty Filter */}
                        <div className="dsa-filter-bar">
                            <span>Filter Difficulty:</span>
                            {['ALL', 'MEDIUM', 'HARD'].map((diff, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`dsa-filter-btn ${dsaDifficultyFilter === diff ? 'dsa-filter-btn--active' : ''}`}
                                    onClick={() => setDsaDifficultyFilter(diff)}
                                >
                                    {diff}
                                </button>
                            ))}
                        </div>

                        <div className="dsa-problems-list">
                            {filteredDsaProblems.map((prob) => (
                                <div key={prob.id} className="dsa-problem-card">
                                    <div className="dsa-p-head">
                                        <div className="dsa-title-row">
                                            <h4 className="dsa-title">{prob.title}</h4>
                                            <span className={`dsa-diff-tag dsa-diff-tag--${prob.difficulty.toLowerCase()}`}>
                                                {prob.difficulty}
                                            </span>
                                        </div>
                                        <a
                                            href={prob.leetcodeUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="dsa-lc-link"
                                        >
                                            Solve on LeetCode <ExternalLink size={12} />
                                        </a>
                                    </div>

                                    <div className="dsa-pattern-badge">
                                        <strong>Pattern:</strong> {prob.pattern}
                                    </div>

                                    <div className="dsa-complexities">
                                        <span className="dsa-comp-pill">⏱️ {prob.timeComplexity}</span>
                                        <span className="dsa-comp-pill">💾 {prob.spaceComplexity}</span>
                                    </div>

                                    <div className="dsa-approach">
                                        <strong>💡 Optimal Solution Blueprint:</strong>
                                        <p>{prob.approach}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'aptitude':
                return (
                    <div className="aptitude-view">
                        <div className="view-intro">
                            <p>Quantitative calculations, distributed systems logic, and core CS principles tested in initial screening rounds.</p>
                        </div>

                        <div className="aptitude-cards-list">
                            {APTITUDE_AND_LOGIC.map((item) => (
                                <div key={item.id} className="aptitude-card">
                                    <div className="apt-head">
                                        <span className="apt-cat-tag">{item.category}</span>
                                        <span className="apt-formula-tag">📐 {item.formula}</span>
                                    </div>
                                    <h4 className="apt-question">{item.question}</h4>
                                    <div className="apt-solution">
                                        <strong>🎯 Step-by-Step Logic Breakdown:</strong>
                                        <pre>{item.solution}</pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'match':
                return (
                    <div className="match-view">
                        {summaryAssessment && (
                            <div className="summary-card">
                                <div className="summary-card-header">
                                    <ShieldCheck size={18} className="text-accent" />
                                    <h3>Executive Hiring Assessment</h3>
                                </div>
                                <p>{summaryAssessment}</p>
                            </div>
                        )}

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
                                <span className="kw-banner-label">Matched Skills & Keywords</span>
                            </div>
                            <div className="kw-banner-item">
                                <span className="kw-banner-val" style={{ color: 'var(--error)' }}>
                                    {missingKeywords.length}
                                </span>
                                <span className="kw-banner-label">Missing / Growth Skills</span>
                            </div>
                            <div className="kw-banner-item">
                                <span className="kw-banner-val" style={{ color: 'var(--success)' }}>
                                    {keywordCoverage}%
                                </span>
                                <span className="kw-banner-label">ATS Coverage Rate</span>
                            </div>
                            <div className="kw-banner-item">
                                <span className="kw-banner-val" style={{ color: 'var(--accent)' }}>
                                    +{Math.round((missingKeywords.length / (totalKeywords || 1)) * 30)}%
                                </span>
                                <span className="kw-banner-label">Potential Score Boost</span>
                            </div>
                        </div>

                        <div className="kw-category-filter-bar">
                            <span className="kw-filter-label"><Filter size={14} /> Filter by Domain:</span>
                            <div className="kw-filter-pills">
                                {keywordCategories.map((cat, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className={`kw-filter-btn ${keywordCategoryFilter === cat ? 'kw-filter-btn--active' : ''}`}
                                        onClick={() => setKeywordCategoryFilter(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="keyword-group">
                            <div className="keyword-group-header">
                                <h3 className="keyword-group-title text-error">
                                    <XCircle size={18} /> Missing Job Requirements & Placement Advice ({filteredMissingKeywords.length})
                                </h3>
                                <span className="keyword-group-hint">Incorporate these skills to optimize your resume for ATS screening</span>
                            </div>

                            <div className="missing-kw-cards-grid">
                                {filteredMissingKeywords.map((item, i) => {
                                    const priority = item.priority || 'important';
                                    return (
                                        <div key={i} className={`missing-kw-card missing-kw-card--${priority}`}>
                                            <div className="mkw-head">
                                                <div className="mkw-title-row">
                                                    <h4 className="mkw-name">{item.keyword}</h4>
                                                    <span className={`kp-priority kp-priority--${priority}`}>{priority}</span>
                                                </div>
                                                {item.category && <span className="mkw-category">{item.category}</span>}
                                            </div>
                                            <p className="mkw-recommendation">
                                                <strong>💡 Where to add:</strong> {item.recommendation || `Include ${item.keyword} in your technical skills inventory and work experience bullets.`}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="keyword-group">
                            <div className="keyword-group-header">
                                <h3 className="keyword-group-title text-success">
                                    <CheckCircle2 size={18} /> Verified Matched Skills ({filteredMatchedKeywords.length})
                                </h3>
                                <span className="keyword-group-hint">Skills found in your resume that directly align with the job description</span>
                            </div>

                            <div className="keyword-tags">
                                {filteredMatchedKeywords.map((item, i) => (
                                    <div key={i} className="keyword-pill keyword-pill--matched" title={item.context || ''}>
                                        <span className="kp-check">✓</span>
                                        <span className="kp-name">{typeof item === 'string' ? item : item.keyword}</span>
                                        {item.category && <span className="kp-category">{item.category}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'parsed':
                return (
                    <div className="parsed-view">
                        <div className="parsed-header-card">
                            <div className="parsed-avatar-box">
                                <div className="parsed-avatar">
                                    <User size={30} />
                                </div>
                                <span className="parsed-status-dot" title="Digitized & Verified">✓</span>
                            </div>

                            <div className="parsed-header-info">
                                <div className="parsed-name-row">
                                    <h2>{candidateName}</h2>
                                    <span className="parsed-role-tag">
                                        <Briefcase size={12} /> {jobRole}
                                    </span>
                                </div>

                                <div className="parsed-contact-row">
                                    {parsedProfile.email && (
                                        <a href={`mailto:${parsedProfile.email}`} className="parsed-contact-item">
                                            <Mail size={13} /> {parsedProfile.email}
                                        </a>
                                    )}
                                    {parsedProfile.phone && (
                                        <a href={`tel:${parsedProfile.phone}`} className="parsed-contact-item">
                                            <Phone size={13} /> {parsedProfile.phone}
                                        </a>
                                    )}
                                    {parsedProfile.location && (
                                        <span className="parsed-contact-item">
                                            <MapPin size={13} /> {parsedProfile.location}
                                        </span>
                                    )}
                                    {parsedProfile.linkedin && (
                                        <a href={parsedProfile.linkedin} target="_blank" rel="noreferrer" className="parsed-contact-item parsed-contact-item--link">
                                            <Linkedin size={13} /> LinkedIn <ArrowUpRight size={11} />
                                        </a>
                                    )}
                                    {parsedProfile.github && (
                                        <a href={parsedProfile.github} target="_blank" rel="noreferrer" className="parsed-contact-item parsed-contact-item--link">
                                            <Github size={13} /> GitHub <ArrowUpRight size={11} />
                                        </a>
                                    )}
                                </div>

                                <div className="parsed-stats-row">
                                    <span className="p-stat-badge">
                                        <Briefcase size={12} /> {totalExperienceRoles} Experience Position(s)
                                    </span>
                                    <span className="p-stat-badge">
                                        <Code size={12} /> {candidateSkills.length + candidateTools.length} Extracted Skills
                                    </span>
                                    <span className="p-stat-badge">
                                        <Layers size={12} /> {parsedProfile.projects?.length || 3} Highlighted Projects
                                    </span>
                                    {parsedProfile.education?.[0] && (
                                        <span className="p-stat-badge">
                                            <GraduationCap size={12} /> {parsedProfile.education[0].degree}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {parsedProfile.summary && (
                            <div className="parsed-section">
                                <h3 className="parsed-section-title">
                                    <FileText size={16} /> Executive Profile & Career Summary
                                </h3>
                                <div className="parsed-summary-box">
                                    <p>{parsedProfile.summary}</p>
                                </div>
                            </div>
                        )}

                        <div className="parsed-section">
                            <h3 className="parsed-section-title">
                                <Code size={16} /> Verified Technical & Competency Matrix
                            </h3>
                            <div className="parsed-skills-grid">
                                {candidateSkills.length > 0 && (
                                    <div className="psg-block">
                                        <div className="psg-head">
                                            <Code size={15} className="text-accent" />
                                            <h4>Languages & Core Technical Skills</h4>
                                        </div>
                                        <div className="psg-tags">
                                            {candidateSkills.map((s, i) => (
                                                <span key={i} className="psg-tag psg-tag--skill">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {candidateTools.length > 0 && (
                                    <div className="psg-block">
                                        <div className="psg-head">
                                            <Layers size={15} className="text-violet" />
                                            <h4>Frameworks, Tools & Cloud</h4>
                                        </div>
                                        <div className="psg-tags">
                                            {candidateTools.map((t, i) => (
                                                <span key={i} className="psg-tag psg-tag--tool">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {parsedProfile.softSkills?.length > 0 && (
                                    <div className="psg-block">
                                        <div className="psg-head">
                                            <UserCheck size={15} className="text-success" />
                                            <h4>Leadership & Domain Methodologies</h4>
                                        </div>
                                        <div className="psg-tags">
                                            {parsedProfile.softSkills.map((m, i) => (
                                                <span key={i} className="psg-tag psg-tag--soft">{m}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {parsedProfile.experience?.length > 0 && (
                            <div className="parsed-section">
                                <h3 className="parsed-section-title">
                                    <Briefcase size={16} /> Work Experience & Career Journey
                                </h3>
                                <div className="parsed-exp-list">
                                    {parsedProfile.experience.map((exp, i) => (
                                        <div key={i} className="parsed-exp-card">
                                            <div className="parsed-exp-head">
                                                <div className="pex-role-group">
                                                    <h4 className="parsed-exp-role">{exp.title}</h4>
                                                    <span className="parsed-exp-company">{exp.company}</span>
                                                </div>
                                                <div className="pex-meta-group">
                                                    <span className="parsed-exp-duration">{exp.duration}</span>
                                                    {exp.location && <span className="parsed-exp-loc">{exp.location}</span>}
                                                </div>
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

                        {parsedProfile.projects && parsedProfile.projects.length > 0 && (
                            <div className="parsed-section">
                                <h3 className="parsed-section-title">
                                    <Layers size={16} /> Featured Engineering Projects & AI Systems
                                </h3>
                                <div className="parsed-projects-grid">
                                    {parsedProfile.projects.map((proj, i) => (
                                        <div key={i} className="parsed-project-card">
                                            <div className="ppc-header">
                                                <h4 className="ppc-name">{proj.name}</h4>
                                            </div>
                                            <p className="ppc-desc">{proj.description}</p>
                                            {proj.technologies?.length > 0 && (
                                                <div className="ppc-techs">
                                                    {proj.technologies.map((tech, j) => (
                                                        <span key={j} className="ppc-tech-tag">{tech}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {parsedProfile.education?.length > 0 && (
                            <div className="parsed-section">
                                <h3 className="parsed-section-title">
                                    <GraduationCap size={16} /> Education & Verified Credentials
                                </h3>
                                <div className="parsed-edu-grid">
                                    {parsedProfile.education.map((edu, i) => (
                                        <div key={i} className="parsed-edu-card">
                                            <div className="pec-head">
                                                <GraduationCap size={18} className="text-accent" />
                                                <h4>{edu.degree}</h4>
                                            </div>
                                            <p className="pe-school">{edu.institution}</p>
                                            <span className="pe-year">{edu.year}</span>
                                            {edu.details && <p className="pe-details">{edu.details}</p>}
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
                        <div className="view-intro">
                            <p>7-Day Day-by-Day Intensive Preparation Plan. Check off daily milestones as you prepare!</p>
                        </div>
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
                                            <ul className="timeline-tasks-interactive">
                                                {(day.tasks || day.task || []).map((t, j) => {
                                                    const isDone = !!completedTasks[`${i}-${j}`];
                                                    return (
                                                        <li
                                                            key={j}
                                                            className={`task-interactive-item ${isDone ? 'task-interactive-item--done' : ''}`}
                                                            onClick={() => toggleTask(i, j)}
                                                        >
                                                            <div className="task-checkbox">
                                                                {isDone ? <Check size={13} className="text-success" /> : null}
                                                            </div>
                                                            <span className="task-text">{t}</span>
                                                        </li>
                                                    );
                                                })}
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
                    <span>{candidateName}</span> · {jobRole} Master Preparation Suite
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

                {/* ── RIGHT: Hero Score, Master Downloads & Navigation ── */}
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
                                <span className="sc-q-val">{CURATED_DSA_PROBLEMS.length}</span>
                                <span className="sc-q-label">LeetCode Qs</span>
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

                    {/* Download Master Preparation Guide CTA */}
                    <button
                        className={`download-btn download-btn--prep ${downloadingPrepGuide ? 'download-btn--loading' : ''}`}
                        onClick={handleDownloadPrepGuide}
                        disabled={downloadingPrepGuide}
                    >
                        {downloadingPrepGuide ? (
                            <>
                                <div className="download-btn-shimmer" />
                                <Loader2 size={18} className="animate-spin" />
                                <span>GENERATING PREP GUIDE...</span>
                            </>
                        ) : (
                            <>
                                <BookOpen size={18} />
                                <span>DOWNLOAD PREP GUIDE (PDF)</span>
                            </>
                        )}
                    </button>

                    {/* Download AI Resume CTA */}
                    <button
                        className={`download-btn download-btn--resume ${downloadingResume ? 'download-btn--loading' : ''}`}
                        onClick={handleDownloadResume}
                        disabled={downloadingResume}
                    >
                        {downloadingResume ? (
                            <>
                                <div className="download-btn-shimmer" />
                                <Loader2 size={18} className="animate-spin" />
                                <span>GENERATING RESUME...</span>
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
