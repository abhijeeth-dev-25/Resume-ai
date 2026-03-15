import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

// ─── Token expiry helpers ─────────────────────────────────────────────────────
const TOKEN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const AUTO_LOGOUT_BUFFER_MS = 60 * 1000;        // logout 1 min early

function saveLoginTime() {
    sessionStorage.setItem('loginAt', Date.now().toString());
}

function getLoginTime() {
    const t = sessionStorage.getItem('loginAt');
    return t ? parseInt(t, 10) : null;
}

function msUntilExpiry() {
    const loginAt = getLoginTime();
    if (!loginAt) return 0;
    const elapsed = Date.now() - loginAt;
    const remaining = TOKEN_DURATION_MS - elapsed - AUTO_LOGOUT_BUFFER_MS;
    return Math.max(remaining, 0);
}

// ─── Theme helpers ────────────────────────────────────────────────────────────
function getStoredTheme() {
    return localStorage.getItem('theme') || 'light';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// ─── Provider ────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setThemeState]= useState(getStoredTheme);
    const logoutTimerRef        = useRef(null);

    // Apply theme on mount and whenever it changes
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // Schedule auto-logout
    const scheduleAutoLogout = (logoutFn) => {
        clearTimeout(logoutTimerRef.current);
        const ms = msUntilExpiry();
        if (ms > 0) {
            logoutTimerRef.current = setTimeout(() => {
                logoutFn();
            }, ms);
        }
    };

    // Fetch current user on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authService.getMe();
                setUser(response.user);
                scheduleAutoLogout(performLogout);
            } catch {
                setUser(null);
                sessionStorage.removeItem('loginAt');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();

        return () => clearTimeout(logoutTimerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const performLogout = async () => {
        try { await authService.logout(); } catch { /* ignore */ }
        clearTimeout(logoutTimerRef.current);
        sessionStorage.removeItem('loginAt');
        setUser(null);
    };

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        saveLoginTime();
        setUser(response.user);
        scheduleAutoLogout(performLogout);
        return response;
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        saveLoginTime();
        setUser(response.user);
        scheduleAutoLogout(performLogout);
        return response;
    };

    const logout = () => performLogout();

    const toggleTheme = () => {
        setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        theme,
        toggleTheme,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
