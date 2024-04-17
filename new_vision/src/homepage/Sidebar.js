import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import axios from "axios";
import { SERVER_URL } from "./config";
import { useNavigate } from 'react-router-dom';


const serverUrl = SERVER_URL;
axios.defaults.withCredentials = true;

const Sidebar = ({ isOpen, setCompanyId, setYear, setCompanyname }) => {
  const navigate = useNavigate(); 
  const sidebarClasses = `sidebar ${isOpen ? "open" : "hidden"}`;
  const [selectedCompany, setSelectedCompany] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedCompany2, setSelectedCompany2] = useState("");
  const [filteredCompanies2, setFilteredCompanies2] = useState([]); // 新增状态变量
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedYear2, setSelectedYear2] = useState(""); // 可以使用同一个年份列表
  const [isComparing, setIsComparing] = useState(false);
  const [companyId, getcompanyId] = useState("");
  const [companyId2, getcompanyId2] = useState("")

  useEffect(() => {
    if (filteredCompanies.length > 0) {
      getcompanyId(filteredCompanies[0].id);
    }
  }, [filteredCompanies]);

  useEffect(() => {
    if (filteredCompanies2.length > 0) {
      getcompanyId2(filteredCompanies2[0].id);
    }
  }, [filteredCompanies2]);

  

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get(`${serverUrl}/app/years/`);
        setYears(response.data.map((item) => item.year));
      } catch (error) {
        console.error("Failed to fetch years:", error);
      }
    };

    fetchYears();
  }, []);

  useEffect(() => {

    if (isComparing && selectedCompany && selectedCompany2 && selectedYear && selectedYear2) {

      const params = {
        company1: selectedCompany,
        year1: selectedYear,
        companyid1: companyId,
        company2: selectedCompany2,
        year2: selectedYear2,
        companyid2: companyId2
      };


      const queryString = new URLSearchParams(params).toString();
      navigate(`/compare?${queryString}`);
    }
  }, [selectedCompany, selectedCompany2,companyId,companyId2, selectedYear, selectedYear2, isComparing, navigate]);
  
  

  const handleInputChange = async (e, isSecondCompany = false) => {
    const value = e.target.value.trim();
    if (isSecondCompany) {
      setSelectedCompany2(value);
    } else {
      setSelectedCompany(value);
    }
  
    if (value.length >= 1) {
      try {
        const apiURL = `${serverUrl}/app/fsearch/${value}/`;
        const response = await axios.get(apiURL, { withCredentials: true });
        const companies = response.data.map((company) => ({
          name: company.name,
          id: company.id,
        }));
        if (isSecondCompany) {
          setFilteredCompanies2(companies);
        } else {
          setFilteredCompanies(companies);
        }
      } catch (error) {
        console.error("Failed to fetch filtered companies:", error);
      }
    } else {
      if (isSecondCompany) {
        setFilteredCompanies2([]);
      } else {
        setFilteredCompanies([]);
      }
    }
  };

  const handleInputChange2 = async (e, isSecondCompany = false) => {
    const value = e.target.value.trim();
    if (isSecondCompany) {
      setSelectedCompany2(value);
    } else {
      setSelectedCompany(value);
    }
  
    if (value.length >= 1) {
      try {
        const apiURL = `${serverUrl}/app/fsearch/${value}/`;
        const response = await axios.get(apiURL, { withCredentials: true });
        
        const companies = response.data.map((company) => ({
          name: company.name,
          id: company.id,
        }));
        if (isSecondCompany) {
          setFilteredCompanies2(companies);
        } else {
          setFilteredCompanies(companies);
        }
      } catch (error) {
        console.error("Failed to fetch filtered companies:", error);
      }
    } else {
      if (isSecondCompany) {
        setFilteredCompanies2([]);
      } else {
        setFilteredCompanies([]);
      }
    }
  };

  const finalizeSelection = () => {
    const company = filteredCompanies.find((c) => c.name === selectedCompany);
    if (company) {
      setCompanyId(company.id);
      setCompanyname(company.name);
    }
  };

  

  const toggleCompare = () => setIsComparing(!isComparing);

  return (
    <div className={sidebarClasses}>
      <div className="sidebar-header">
        <div className="logo">
          <img
            src="/esglogoopy.png"
            alt="Logo"
            style={{ width: "200px", height: "200px" }}
          />
        </div>
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
                onChange={handleInputChange} // 只处理输入变化，不设置公司名称
                onBlur={finalizeSelection} // 在这里处理最终选择，设置公司ID和名称
                placeholder="Search a company"
              />
            <datalist id="company-options">
              {filteredCompanies.map((company, index) => (
                <option key={index} value={company.name} />
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
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setYear(e.target.value);
              }}
            >
              <option value="" disabled hidden>
                Choose a year
              </option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </li>
          <li>
            <button className="compare-btn" onClick={toggleCompare}>
              Compare with another company
            </button>
          </li>
          {isComparing && (
            <>
              <li>
                <label className="label" htmlFor="company2">
                  Second Company
                </label>
                <input
                  className="input"
                  list="company-options2"
                  id="company2"
                  value={selectedCompany2}
                  onChange={(e) => handleInputChange2(e, true)}
                  placeholder="Search another company"
                />
                 <datalist id="company-options2">
                    {filteredCompanies2.map((company2, index) => (
                      <option key={index} value={company2.name} />
                    ))}
                  </datalist>
              </li>
              
              <li>
                <label className="label" htmlFor="year2">
                  Year
                </label>
                <select
                  className="select"
                  id="year2"
                  value={selectedYear2}
                  onChange={(e) => setSelectedYear2(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Choose a year
                  </option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
