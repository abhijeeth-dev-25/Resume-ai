import React, { forwardRef } from 'react';
import './Input.scss';

const Input = forwardRef(({
    label,
    error,
    id,
    type = 'text',
    className = '',
    icon: Icon,
    ...props
}, ref) => {
    return (
        <div className={`input-wrapper ${className}`}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <div className="input-container">
                {Icon && <span className="input-icon"><Icon size={18} /></span>}
                <input
                    ref={ref}
                    id={id}
                    type={type}
                    className={`input-field ${Icon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''}`}
                    {...props}
                />
            </div>
            {error && <p className="input-error-msg">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
