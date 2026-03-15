import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ThemeToggle.scss';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useAuth();
    const isDark = theme === 'dark';

    return (
        <button
            className={`theme-toggle ${isDark ? 'theme-toggle--dark' : 'theme-toggle--light'}`}
            onClick={toggleTheme}
            type="button"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <span className="theme-toggle-track">
                <span className="theme-toggle-thumb" />
            </span>
            <span className="theme-toggle-icon">
                {isDark ? <Moon size={14} /> : <Sun size={14} />}
            </span>
        </button>
    );
};

export default ThemeToggle;
