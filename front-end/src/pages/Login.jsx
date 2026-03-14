import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './AuthForm.scss';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Enter your credentials to access your account</p>
                </div>

                {error && <div className="auth-error-alert">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        label="Email Address"
                        icon={Mail}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        label="Password"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        isLoading={isSubmitting}
                        className="mt-4"
                    >
                        Sign In
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
