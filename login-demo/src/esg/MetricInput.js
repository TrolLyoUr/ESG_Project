import React, { useState } from 'react';
import './MetricInput.css';

function MetricInput() {
    const [showContent, setShowContent] = useState(false);
    // 初始化每个权重的选中状态
    const [selectedWeights, setSelectedWeights] = useState({
        weight1: false,
        weight2: false,
        weight3: false,
    });

    const toggleShowContent = () => {
        setShowContent(!showContent);
    };

    // 切换特定权重的选中状态
    const toggleWeightSelection = (weightKey) => {
        setSelectedWeights((prevWeights) => ({
            ...prevWeights,
            [weightKey]: !prevWeights[weightKey],
        }));
    };

    return (
        <div className="metric-input">
            <button onClick={toggleShowContent}>
                {showContent ? 'Hide Metrcis' : 'Show Metrcis'}
            </button>

            {showContent && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p><span><span style={{ backgroundColor: 'rgba(0, 255, 208, 0.689)' }}>GRI 303-1</span> <span style={{ backgroundColor: 'rgba(255, 208, 0, 0.689)' }}>85</span></span></p>
                        <input
                            type="checkbox"
                            checked={selectedWeights.weight1}
                            onChange={() => toggleWeightSelection('weight1')}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p><span><span style={{ backgroundColor: 'rgba(0, 255, 208, 0.689)' }}>GRI 303-1</span> <span style={{ backgroundColor: 'rgba(255, 208, 0, 0.689)' }}>84</span></span></p>
                        <input
                            type="checkbox"
                            checked={selectedWeights.weight2}
                            onChange={() => toggleWeightSelection('weight2')}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p><span><span style={{ backgroundColor: 'rgba(0, 255, 208, 0.689)' }}>GRI 303-1</span> <span style={{ backgroundColor: 'rgba(255, 208, 0, 0.689)' }}>87</span></span></p>
                        <input
                            type="checkbox"
                            checked={selectedWeights.weight3}
                            onChange={() => toggleWeightSelection('weight3')}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default MetricInput;
