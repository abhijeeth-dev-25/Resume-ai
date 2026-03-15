import React, { forwardRef } from 'react';
import './Input.scss';

const Input = forwardRef(({
    label,
    error,
    hint,
    id,
    type = 'text',
    className = '',
    icon: Icon,
    multiline = false,
    rows = 5,
    ...props
}, ref) => {
    const fieldClass = `input-field ${Icon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''}`;

    return (
        <div className={`input-wrapper ${className}`}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <div className="input-container">
                {Icon && !multiline && (
                    <span className="input-icon"><Icon size={16} /></span>
                )}
                {multiline ? (
                    <textarea
                        ref={ref}
                        id={id}
                        rows={rows}
                        className={`${fieldClass} input-textarea`}
                        {...props}
                    />
                ) : (
                    <input
                        ref={ref}
                        id={id}
                        type={type}
                        className={fieldClass}
                        {...props}
                    />
                )}
            </div>
            {error && <p className="input-error-msg"><span>⚠</span> {error}</p>}
            {hint && !error && <p className="input-hint">{hint}</p>}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
