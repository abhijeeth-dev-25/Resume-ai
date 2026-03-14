import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './AuthForm.scss';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register } = useAuth();
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
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <h2>Create Account</h2>
                    <p>Join us today and experience the difference.</p>
                </div>

                {error && <div className="auth-error-alert">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        label="Username"
                        icon={User}
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
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
                        minLength={6}
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        isLoading={isSubmitting}
                        className="mt-4"
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
