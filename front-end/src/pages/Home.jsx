import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const Home = () => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to login if user is not authenticated
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) return null;
    if (!user) return null;

    // After login just show home page with black screen for now
    return (
        <div style={{ backgroundColor: '#000000', width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
            <Button variant="secondary" onClick={logout}>Logout</Button>
            <p style={{ color: '#333333', marginTop: '1rem', fontFamily: 'monospace' }}>Authenticated User: {user.username}</p>
        </div>
    );
};

export default Home;
