import React, { useState } from 'react';
import { Navigate, Link } from 'react-router';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import './AuthForm.scss';

// ── Password strength ──────────────────────────────────────────────────────────
function getStrength(password) {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8)   score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const map = [
        { level: 0, label: '',         color: '' },
        { level: 1, label: 'Weak',     color: 'var(--error)' },
        { level: 2, label: 'Fair',     color: 'var(--warning)' },
        { level: 3, label: 'Good',     color: 'var(--accent-light)' },
        { level: 4, label: 'Strong',   color: 'var(--success)' },
    ];
    return map[score];
}

const Register = () => {
    const [formData, setFormData]         = useState({ username: '', email: '', password: '' });
    const [fieldErrors, setFieldErrors]   = useState({});
    const [apiError, setApiError]         = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, isAuthenticated } = useAuth();
    const strength = getStrength(formData.password);

    // ── Auth guard ─────────────────────────────────────────────────────────────
    if (isAuthenticated) return <Navigate to="/" replace />;

    const validate = () => {
        const errors = {};
        if (!formData.username) errors.username = 'Username is required.';
        if (!formData.email)    errors.email    = 'Email is required.';
        if (!formData.password) errors.password = 'Password is required.';
        else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters.';
        return errors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (fieldErrors[e.target.id]) setFieldErrors({ ...fieldErrors, [e.target.id]: '' });
        if (apiError) setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length) { setFieldErrors(errors); return; }

        setIsSubmitting(true);
        try {
            await register(formData);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="gradient-bg" />

            <div className="auth-theme-btn">
                <ThemeToggle />
            </div>

            <div className="auth-card glass-panel" style={{ animation: 'fadeUp 0.5s ease-out' }}>
                <div className="auth-header">
                    <h2>Create Account</h2>
                    <p>Join and start your AI-powered interview prep</p>
                </div>

                {apiError && (
                    <div className="auth-api-error" role="alert">
                        <span className="auth-api-error-icon">⚠</span>
                        <span>{apiError}</span>
                        <button className="auth-api-error-close" onClick={() => setApiError('')}>✕</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        label="Username"
                        icon={User}
                        value={formData.username}
                        onChange={handleChange}
                        error={fieldErrors.username}
                        autoComplete="username"
                    />
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        label="Email Address"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        error={fieldErrors.email}
                        autoComplete="email"
                    />

                    {/* Password with strength meter */}
                    <div className="input-password-wrapper">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            label="Password"
                            icon={Lock}
                            value={formData.password}
                            onChange={handleChange}
                            error={fieldErrors.password}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(p => !p)}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {formData.password && (
                        <div className="password-strength">
                            <div className="password-strength-bars">
                                {[1, 2, 3, 4].map(i => (
                                    <div
                                        key={i}
                                        className="password-strength-bar"
                                        style={{
                                            background: i <= strength.level ? strength.color : 'var(--border-color)',
                                            transition: 'background 0.3s',
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="password-strength-label" style={{ color: strength.color }}>
                                {strength.label}
                            </span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        size="lg"
                        isLoading={isSubmitting}
                        className="auth-submit-btn"
                    >
                        Create Account
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
