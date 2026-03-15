import React from 'react';
import './DocumentLoader.scss';

const DocumentLoader = () => {
    return (
        <div className="doc-loader-wrapper">
            <div className="puzzle-container">
                {/* Custom blocks of varying sizes representing AI parsing components */}
                        <div className="puzzle-block block-sq block-v1">
                            <div className="line line-1"></div>
                            <div className="line line-2"></div>
                        </div>

                        <div className="puzzle-block block-hz block-e">
                            <div className="line line-1"></div>
                            <div className="line line-2"></div>
                        </div>

                        <div className="puzzle-block block-vt block-a">
                            <div className="line line-1"></div>
                            <div className="line line-2"></div>
                            <div className="line line-3"></div>
                            <div className="line line-4"></div>
                        </div>

                        <div className="puzzle-block block-sq block-v2">
                            <div className="line line-1"></div>
                            <div className="line line-2"></div>
                        </div>

                        <div className="puzzle-block block-hz block-r">
                            <div className="line line-1"></div>
                            <div className="line line-2"></div>
                        </div>
            </div>
            
            <div className="doc-loader-text">
                <p>Analyzing your profile with AI…</p>
                <span>This may take up to 30 seconds</span>
            </div>
        </div>
    );
};

export default DocumentLoader;
