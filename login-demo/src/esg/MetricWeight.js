import React, { useState } from 'react';
import './MetricInput.css';

function MetricWeight() {
    const [showContent, setShowContent] = useState(false);
    // 初始化每个输入字段的状态
    const [weights, setWeights] = useState({
        weight1: '0.3',
        weight2: '0.3',
        weight3: '0.4',
    });

    const toggleShowContent = () => {
        setShowContent(!showContent);
    };

    // 更新特定权重的值
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
                <div>
                    <div style={{ display: 'block' }}>
                        <p>
                            <span>
                                <span style={{ backgroundColor: 'rgba(0, 255, 208, 0.689)' }}>GRI 303-1</span>
                                <input
                                    type="text"
                                    value={weights.weight1}
                                    onChange={(e) => handleWeightChange('weight1', e.target.value)}
                                    style={{ backgroundColor: 'rgba(255, 208, 0, 0.689)' }}
                                />
                            </span>
                        </p>
                    </div>
                    <div style={{ display: 'block' }}>
                        <p>
                            <span>
                                <span style={{ backgroundColor: 'rgba(0, 255, 208, 0.689)' }}>GRI 303-1</span>
                                <input
                                    type="text"
                                    value={weights.weight2}
                                    onChange={(e) => handleWeightChange('weight2', e.target.value)}
                                    style={{ backgroundColor: 'rgba(255, 208, 0, 0.689)' }}
                                />
                            </span>
                        </p>
                    </div>
                    <div style={{ display: 'block' }}>
                        <p>
                            <span>
                                <span style={{ backgroundColor: 'rgba(0, 255, 208, 0.689)' }}>GRI 303-1</span>
                                <input
                                    type="text"
                                    value={weights.weight3}
                                    onChange={(e) => handleWeightChange('weight3', e.target.value)}
                                    style={{ backgroundColor: 'rgba(255, 208, 0, 0.689)' }}
                                />
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MetricWeight;
