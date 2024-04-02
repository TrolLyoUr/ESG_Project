import React, { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('YOUR_API_ENDPOINT'); // 替换为你的API端点
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCompanies(data);  // 假设API直接返回公司名称数组
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  const handleSubmit = async () => {
    if (selectedCompany && selectedYear && selectedFramework) {
      // 所有选项都已选择，发送请求到后端
      try {
        const response = await fetch('YOUR_SUBMIT_ENDPOINT', { // 替换为提交到的后端API端点
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            company: selectedCompany,
            year: selectedYear,
            framework: selectedFramework,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // 假设后端返回JSON数据
        console.log('Submit response:', data);
        // 处理返回的数据
      } catch (error) {
        console.error('Failed to submit:', error);
      }
    } else {
      alert('Please select all options before confirming.');
    }
  };

  return (
    <div className="sidebar">
      <ul>
        <li>
          <label className="label" htmlFor="company">Company</label>
          <select className="select" id="company" value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
            <option value="" disabled hidden>Choose a company</option>
            {companies.map((company, index) => (
              <option key={index} value={company}>{company}</option>
            ))}
          </select>
        </li>
        <li>
          <label className="label" htmlFor="year">Year</label>
          <select className="select" id="year" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            <option value="" disabled hidden>Choose a year</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
          </select>
        </li>
        <li>
          <label className="label" htmlFor="framework">Framework</label>
          <select className="select" id="framework" value={selectedFramework} onChange={e => setSelectedFramework(e.target.value)}>
            <option value="" disabled hidden>Choose a framework</option>
            <option value="GRI">GRI</option>
            <option value="SASB">SASB</option>
            <option value="TCFD">TCFD</option>
          </select>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
