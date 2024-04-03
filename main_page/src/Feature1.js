import React, { useState } from 'react';
import './Feature1.css';

const Feature1 = ({ setSelectedId }) => { // 接收来自父组件的setSelectedId函数
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionSelect = async (option) => {
    setSelectedOption(option);
    console.log('Selected option:', option);

    // 创建一个映射，将每个选项映射到其对应的ID
    const optionToIdMap = {
      'GRI': 4,
      'SASB': 5,
      'TCFD': 6,
    };

    const id = optionToIdMap[option];
    setSelectedId(id); // 使用setSelectedId更新父组件中的selectedId

    // 你的API请求和其他逻辑...
  };

  return (
    <div className="feature-area feature-area-1">
      <div className="options">
        {['GRI', 'SASB', 'TCFD'].map((option) => (
          <button
            key={option}
            className={`option-button ${selectedOption === option ? 'selected' : ''}`}
            onClick={() => handleOptionSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Feature1;
