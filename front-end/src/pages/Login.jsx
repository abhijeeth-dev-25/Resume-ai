import React, { useState } from 'react';
import { Navigate, Link } from 'react-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import './AuthForm.scss';

const Login = () => {
    const [formData, setFormData]         = useState({ email: '', password: '' });
    const [fieldErrors, setFieldErrors]   = useState({});
    const [apiError, setApiError]         = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, isAuthenticated } = useAuth();

    // ── Auth guard: already logged in? bounce to home ─────────────────────────
    if (isAuthenticated) return <Navigate to="/" replace />;

    const validate = () => {
        const errors = {};
        if (!formData.email)    errors.email    = 'Email is required.';
        if (!formData.password) errors.password = 'Password is required.';
        return errors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (fieldErrors[e.target.id]) {
            setFieldErrors({ ...fieldErrors, [e.target.id]: '' });
        }
        if (apiError) setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length) { setFieldErrors(errors); return; }

        setIsSubmitting(true);
        try {
            await login(formData);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Login failed. Please try again.');
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
                    <h2>Welcome Back</h2>
                    <p>Sign in to access your AI interview coach</p>
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
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(p => !p)}
                            tabIndex={-1}
                            title={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        size="lg"
                        isLoading={isSubmitting}
                        className="auth-submit-btn"
                    >
                        Sign In
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Create one</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
