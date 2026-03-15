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
    size = 'md',
    ...props
}) => {
    return (
        <button
            className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
            onClick={onClick}
            type={type}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="btn-spinner" size={16} />}
            <span className={isLoading ? 'btn-content-hidden' : 'btn-content'}>
                {children}
            </span>
        </button>
    );
};

export default Button;
