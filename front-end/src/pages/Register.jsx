import React, { useState } from 'react';
import { Navigate, Link } from 'react-router';
import { useForm, useWatch } from 'react-hook-form';
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
    if (password.length >= 8)          score++;
    if (/[A-Z]/.test(password))        score++;
    if (/[0-9]/.test(password))        score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const map = [
        { level: 0, label: '',       color: '' },
        { level: 1, label: 'Weak',   color: 'var(--error)' },
        { level: 2, label: 'Fair',   color: 'var(--warning)' },
        { level: 3, label: 'Good',   color: 'var(--accent-light)' },
        { level: 4, label: 'Strong', color: 'var(--success)' },
    ];
    return map[score];
}

const Register = () => {
    const [apiError, setApiError]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register: authRegister, isAuthenticated } = useAuth();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm({ mode: 'onTouched' });

    // Watch password live for the strength meter
    const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });
    const strength = getStrength(passwordValue);

    // ── Auth guard ─────────────────────────────────────────────────────────────
    if (isAuthenticated) return <Navigate to="/" replace />;

    const onSubmit = async (data) => {
        setApiError('');
        try {
            await authRegister(data);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
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

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
                    <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        label="Username"
                        icon={User}
                        autoComplete="username"
                        error={errors.username?.message}
                        {...register('username', {
                            required: 'Username is required.',
                            minLength: { value: 3, message: 'Username must be at least 3 characters.' },
                            maxLength: { value: 30, message: 'Username must be at most 30 characters.' },
                            pattern: {
                                value: /^[a-zA-Z0-9_]+$/,
                                message: 'Only letters, numbers and underscores are allowed.',
                            },
                        })}
                    />

                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        label="Email Address"
                        icon={Mail}
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register('email', {
                            required: 'Email is required.',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Enter a valid email address.',
                            },
                        })}
                    />

                    {/* Password with strength meter */}
                    <div className="input-password-wrapper">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            label="Password"
                            icon={Lock}
                            autoComplete="new-password"
                            error={errors.password?.message}
                            {...register('password', {
                                required: 'Password is required.',
                                minLength: { value: 6, message: 'Password must be at least 6 characters.' },
                            })}
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

                    {/* Strength meter — only shows when password has content */}
                    {passwordValue && (
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
