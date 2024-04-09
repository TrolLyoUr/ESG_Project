import React, { useState } from "react";
import "./Sidebar.css";
import axios from "axios";

axios.defaults.withCredentials = true;

const Sidebar = () => {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");

  const handleInputChange = async (e) => {
    const value = e.target.value.trim();
    setSelectedCompany(value); // 更新输入框的值

    // 只有当用户输入的字符数达到或超过1时才发起请求
    if (value.length >= 1) {
      try {
        // 根据用户输入动态构造API URL
        const apiURL = `http://9900.seasite.top:8000/app/fsearch/${value}/`;
        const response = await axios.get(apiURL, { withCredentials: true });

        // 提取公司名称并更新状态
        const companyName = response.data.map((company) => company.name);
        setFilteredCompanies(companyName);
      } catch (error) {
        console.error("Failed to fetch filtered companies:", error);
      }
    } else {
      // 如果用户输入少于1个字符，则清空当前的筛选结果
      setFilteredCompanies([]);
    }
  };

  const handleSubmit = async () => {
    if (selectedCompany && selectedYear && selectedFramework) {
      // 所有选项都已选择，发送请求到后端
      try {
        const response = await fetch("YOUR_SUBMIT_ENDPOINT", {
          // 替换为提交到的后端API端点
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
        console.log("Submit response:", data);
        // 处理返回的数据
      } catch (error) {
        console.error("Failed to submit:", error);
      }
    } else {
      alert("Please select all options before confirming.");
    }
  };

  return (
    <div className="sidebar">
      <ul>
        <li>
          <label className="label" htmlFor="company">
            Company
          </label>
          <input
            className="input"
            list="company-options"
            id="company"
            value={selectedCompany}
            onChange={handleInputChange}
            placeholder="Search a company"
          />
          <datalist id="company-options">
            {filteredCompanies.map((company, index) => (
              <option key={index} value={company} />
            ))}
          </datalist>
        </li>
        <li>
          <label className="label" htmlFor="year">
            Year
          </label>
          <select
            className="select"
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="" disabled hidden>
              Choose a year
            </option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
          </select>
        </li>
        {/* <li>
          <label className="label" htmlFor="framework">Framework</label>
          <select className="select" id="framework" value={selectedFramework} onChange={e => setSelectedFramework(e.target.value)}>
            <option value="" disabled hidden>Choose a framework</option>
            <option value="GRI">GRI</option>
            <option value="SASB">SASB</option>
            <option value="TCFD">TCFD</option>
          </select>
        </li> */}
      </ul>
      <button type="button" onClick={handleSubmit} className="submit-button">
        Submit
      </button>
    </div>
  );
};

export default Sidebar;
