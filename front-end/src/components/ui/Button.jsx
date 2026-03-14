import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.scss';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    isLoading = false,
    disabled = false,
    className = '',
    fullWidth = false,
    ...props
}) => {
    return (
        <button
            className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${className}`}
            onClick={onClick}
            type={type}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <Loader2 className="btn-spinner" size={18} /> : null}
            <span className={isLoading ? 'btn-content-hidden' : 'btn-content'}>
                {children}
            </span>
        </button>
    );
};

export default Button;
