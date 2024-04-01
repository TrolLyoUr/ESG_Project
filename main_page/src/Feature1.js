import React, { useState } from 'react';
import './Feature1.css'; // Import CSS file specifically created for the Feature1 component

const Feature1 = () => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionSelect = async (option) => {
    setSelectedOption(option);
    console.log('Selected option:', option); // 记录选中的选项，用于调试
  
    try {
      // API请求开始
      const response = await fetch('YOUR_API_ENDPOINT', { // 将'YOUR_API_ENDPOINT'替换为实际的API端点
        method: 'POST', // 请求方法
        headers: {
          'Content-Type': 'application/json', // 设置请求头，声明发送的数据类型为JSON
        },
        body: JSON.stringify({ selectedOption: option }), // 将选中的选项转换为JSON字符串作为请求体
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`); // 如果响应状态不是2xx，抛出错误
      }
  
      const data = await response.json(); // 解析JSON响应体
      console.log('Response from the API:', data); // 记录API的响应，用于调试
      // API请求结束
  
      // 这里可以添加处理响应的逻辑
    } catch (error) {
      console.error('Error sending data to the API:', error); // 处理请求过程中的错误
    }
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
