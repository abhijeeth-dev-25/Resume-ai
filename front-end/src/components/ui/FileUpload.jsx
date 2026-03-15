import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import './FileUpload.scss';

const ACCEPTED_TYPE = 'application/pdf';
const MAX_SIZE_MB = 10;

const FileUpload = ({ value, onChange, error }) => {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [localError, setLocalError] = useState('');

    const validateAndSet = (file) => {
        setLocalError('');
        if (!file) return;
        if (file.type !== ACCEPTED_TYPE) {
            setLocalError('Only PDF files are accepted.');
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setLocalError(`File must be smaller than ${MAX_SIZE_MB} MB.`);
            return;
        }
        onChange(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        validateAndSet(file);
    };

    const handleChange = (e) => validateAndSet(e.target.files[0]);

    const handleRemove = (e) => {
        e.stopPropagation();
        onChange(null);
        setLocalError('');
        if (inputRef.current) inputRef.current.value = '';
    };

    const displayError = error || localError;

    return (
        <div className="file-upload-wrapper">
            <div
                className={`file-upload-zone ${dragging ? 'file-upload-zone--dragging' : ''} ${value ? 'file-upload-zone--filled' : ''} ${displayError ? 'file-upload-zone--error' : ''}`}
                onClick={() => !value && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && !value && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    className="file-upload-input"
                    onChange={handleChange}
                    aria-label="Upload resume PDF"
                />

                {value ? (
                    <div className="file-upload-filled">
                        <div className="file-upload-file-icon">
                            <FileText size={28} />
                        </div>
                        <div className="file-upload-file-info">
                            <span className="file-upload-filename">{value.name}</span>
                            <span className="file-upload-filesize">
                                {(value.size / 1024).toFixed(1)} KB
                            </span>
                        </div>
                        <button
                            className="file-upload-remove"
                            onClick={handleRemove}
                            type="button"
                            title="Remove file"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="file-upload-prompt">
                        <div className="file-upload-icon">
                            <UploadCloud size={32} />
                        </div>
                        <p className="file-upload-text">
                            <strong>Click to upload</strong> or drag &amp; drop
                        </p>
                        <p className="file-upload-subtext">PDF only — max {MAX_SIZE_MB} MB</p>
                    </div>
                )}
            </div>

            {displayError && (
                <p className="file-upload-error">
                    <span>⚠</span> {displayError}
                </p>
            )}
        </div>
    );
};

export default FileUpload;
