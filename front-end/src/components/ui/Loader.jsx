import React from 'react';
import './Loader.scss';

const Loader = ({ global = false, size = 'default' }) => {
    const loaderElement = (
        <div className={`loader-container ${size}`}>
            <div className="loader-spinner"></div>
        </div>
    );

    if (global) {
        return (
            <div className="global-loader-overlay">
                {loaderElement}
            </div>
        );
    }

    return loaderElement;
};

export default Loader;
