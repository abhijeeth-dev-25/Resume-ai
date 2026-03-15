import { createBrowserRouter, Navigate } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Result from './pages/Result';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/result',
        element: <Result />,
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    }
]);
