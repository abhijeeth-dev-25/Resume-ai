import React, { useState } from 'react';
import { Navigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import './AuthForm.scss';

const Login = () => {
    const [apiError, setApiError]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isAuthenticated }      = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({ mode: 'onTouched' });

    // ── Auth guard: already logged in? bounce to home ─────────────────────────
    if (isAuthenticated) return <Navigate to="/" replace />;

    const onSubmit = async (data) => {
        setApiError('');
        try {
            await login(data);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Login failed. Please try again.');
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

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
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

                    <div className="input-password-wrapper">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            label="Password"
                            icon={Lock}
                            autoComplete="current-password"
                            error={errors.password?.message}
                            {...register('password', {
                                required: 'Password is required.',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters.',
                                },
                            })}
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
