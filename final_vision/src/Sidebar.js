import React, { useState, useEffect} from "react";
import "./Sidebar.css";
import axios from "axios";

axios.defaults.withCredentials = true;

const Sidebar = ({ isOpen }) => {
  const sidebarClasses = `sidebar ${isOpen ? "open" : "hidden"}`;
  const [selectedCompany, setSelectedCompany] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [filteredYears, setFilteredYears] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [selectedCompany2, setSelectedCompany2] = useState("");
  const [selectedYear2, setSelectedYear2] = useState("");

  const handleCompanyChange = async (e, isSecondCompany = false) => {
    const value = e.target.value.trim();
    if (!isSecondCompany) {
      setSelectedCompany(value);
    } else {
      setSelectedCompany2(value);
    }
    if (value.length >= 1) {
      try {
          // 根据用户输入动态构造API URL
          const apiURL = `http://9900.seasite.top:8000/app/fsearch/${value}/`;
          const response = await axios.get(apiURL, { withCredentials: true });

          // 提取公司名称并更新状态
        const companyName = response.data.map(company => company.name);
          setFilteredCompanies(companyName);
      } catch (error) {
          console.error('Failed to fetch filtered companies:', error);
      }
    } else {
      if (!isSecondCompany) {
        setFilteredCompanies([]);
        } else {
            // Clear second company's filtered companies if needed
      } 
    }
  };

    useEffect(() => {
    const fetchYears = async () => {
      try {
        const apiURL = `http://9900.seasite.top:8000/app/years/`; // Ensure this is the correct API endpoint
        const response = await axios.get(apiURL, { withCredentials: true });
        const years = response.data.map(yearItem => yearItem.year);
        setFilteredYears(years);
      } catch (error) {
        console.error('Failed to fetch years:', error);
      }
    };

    fetchYears();
    }, []);

  const handleYearChange = async (e, isSecondYear = false) => {
    const value = e.target.value.trim();
    if (!isSecondYear) {
      setSelectedYear(value);
    } else {
      setSelectedYear2(value);
    }
 
  };
  const toggleCompare = () => setIsComparing(!isComparing);
/*
  const handleSubmit = useCallback(async () => {
    if (selectedYear) {
        const dataToSend = { // Assuming selectedCompany holds the ID
            year: selectedYear
        };

        try {
            const response = await axios.post('http://9900.seasite.top:8000/app/submitData', dataToSend, { withCredentials: true });
            console.log('Data submitted successfully:', response.data);
        } catch (error) {
            console.error('Failed to submit data:', error);
        }
    }
}, [selectedYear]);

    useEffect(() => {
    if (selectedYear) {
        handleSubmit();
        }
    }, [selectedYear, handleSubmit]);
*/
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
              onChange={(e) => handleCompanyChange(e)}
              placeholder="Search a company"
            />
            <datalist id="company-options">
              {filteredCompanies.map((company, index) => (
                <option key={index} value={company} />
              ))}
            </datalist>
          </li>
          <li>
            <label className="label" htmlFor="year">Year</label>
            <select className="select" id="year" value={selectedYear} onChange={e => handleYearChange(e)}>
              <option value="" disabled hidden>Choose a year</option>
              {filteredYears.map((year, index) => (
                <option key={index} value={year}>{year}</option>
              ))}
            </select>
          </li>
          <li>
            <button className="compare-btn" onClick={toggleCompare}>Compare with another company</button>
          </li>
          {isComparing && (
            <>
              <li>
                <label className="label" htmlFor="company2">Second Company</label>
                <input
                  className="input"
                  list="company-options2"
                  id="company2"
                  value={selectedCompany2}
                  onChange={(e) => handleCompanyChange(e, true)}
                  placeholder="Search another company"
                />
                {/* You might need a separate datalist for the second company */}
                <datalist id="company-options2">
                  {filteredCompanies.map((company, index) => (
                    <option key={index} value={company} />
                  ))}
                </datalist>
              </li>
              <li>
                <label className="label" htmlFor="year2">Year</label>
                <select className="select" id="year2" value={selectedYear2} onChange={e => handleYearChange(e, true)}>
                  <option value="" disabled hidden>Choose a year</option>
                  {filteredYears.map((year, index) => (
                    <option key={index} value={year}>{year}</option>
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
