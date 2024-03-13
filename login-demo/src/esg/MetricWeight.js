import React, { useState } from 'react';
import './MetricInput.css';

function MetricWeight() {
    const [showContent, setShowContent] = useState(false);
    const [weights, setWeights] = useState({
        weight1: '0.3',
        weight2: '0.3',
        weight3: '0.4',
        weight4: '0.4',
        weight5: '0.4',
        weight6: '0.4',
        weight7: '0.4',

    });

    const toggleShowContent = () => {
        setShowContent(!showContent);
    };

    const handleWeightChange = (key, value) => {
        setWeights(prevWeights => ({
            ...prevWeights,
            [key]: value,
        }));
    };

    return (
        <div className="metric-input">
            <button onClick={toggleShowContent}>
                {showContent ? 'Hide Weights' : 'Show Weights'}
            </button>

            {showContent && (
                <div className="content-container"> {/* 使用 content-container 类来应用样式 */}
                    {Object.entries(weights).map(([key, value]) => (
                        <div key={key} style={{ display: 'block' }}> {/* 确保每个权重独占一行 */}
                            <p>
                                <span>
                                    <span >GRI 303-1</span>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleWeightChange(key, e.target.value)}
                                         // 确保有足够的间隔
                                    />
                                </span>
                            </p>
                        </div>
                        
                    ))}
                </div>
            )}
        </div>
    );
}

export default MetricWeight;
