import React, { useState } from 'react';
import './MetricInput.css';

function MetricInput() {
    const [showContent, setShowContent] = useState(false);
    const [selectedWeights, setSelectedWeights] = useState({
        weight1: false,
        weight2: false,
        weight3: false,
    });

    const toggleShowContent = () => {
        setShowContent(!showContent);
    };

    const toggleWeightSelection = (weightKey) => {
        setSelectedWeights((prevWeights) => ({
            ...prevWeights,
            [weightKey]: !prevWeights[weightKey],
        }));
    };

    return (
        <div className="metric-input">
            <button onClick={toggleShowContent}>
                {showContent ? 'Hide Metrics' : 'Show Metrics'}
            </button>

            {showContent && (
                <div className="content-container"> {/* 应用滚动样式的容器 */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p><span><span>GRI 303-1</span> <span>89</span></span></p>
                        <input
                            type="checkbox"
                            checked={selectedWeights.weight1}
                            onChange={() => toggleWeightSelection('weight1')}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p><span><span>GRI 303-2</span> <span>78</span></span></p>
                        <input
                            type="checkbox"
                            checked={selectedWeights.weight2}
                            onChange={() => toggleWeightSelection('weight2')}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p><span><span>GRI 303-3</span> <span>91</span></span></p>
                        <input
                            type="checkbox"
                            checked={selectedWeights.weight3}
                            onChange={() => toggleWeightSelection('weight3')}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p><span><span>GRI 303-4</span> <span>81</span></span></p>
                        <input
                            type="checkbox"
                            checked={selectedWeights.weight3}
                            onChange={() => toggleWeightSelection('weight3')}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p><span><span>GRI 303-5</span> <span>84</span></span></p>
                        <input
                            type="checkbox"
                            checked={selectedWeights.weight3}
                            onChange={() => toggleWeightSelection('weight3')}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p><span><span>GRI 303-6</span> <span>82</span></span></p>
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
