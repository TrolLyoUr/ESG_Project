import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import axios from "axios";
import { SERVER_URL } from "./config";

const serverUrl = SERVER_URL;
axios.defaults.withCredentials = true;

const Sidebar = ({ isOpen, setCompanyId, setYear }) => {
  const sidebarClasses = `sidebar ${isOpen ? "open" : "hidden"}`;
  const [selectedCompany, setSelectedCompany] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [years, setYears] = useState([]); // State for storing the list of years
  const [selectedYear, setSelectedYear] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [selectedCompany2, setSelectedCompany2] = useState("");
  const [selectedYear2, setSelectedYear2] = useState("");

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

  const handleInputChange = async (e, isSecondCompany = false) => {
    const value = e.target.value.trim();
    if (!isSecondCompany) {
      setSelectedCompany(value);
    } else {
      setSelectedCompany2(value);
    }

    if (value.length >= 1) {
      try {
        const apiURL = `${serverUrl}/app/fsearch/${value}/`;
        const response = await axios.get(apiURL, { withCredentials: true });
        const companies = response.data.map((company) => ({
          name: company.name,
          id: company.id,
        }));
        if (!isSecondCompany) {
          setFilteredCompanies(companies);
        } else {
          // Handle second company filtered list similarly if required
        }
      } catch (error) {
        console.error("Failed to fetch filtered companies:", error);
      }
    } else {
      if (!isSecondCompany) {
        setFilteredCompanies([]);
      } else {
        // Clear second company's filtered companies if needed
      }
    }
  };

  const finalizeSelection = () => {
    const company = filteredCompanies.find((c) => c.name === selectedCompany);
    if (company) {
      setCompanyId(company.id);
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
              onChange={(e) => handleInputChange(e)}
              onBlur={finalizeSelection}
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
                  onChange={(e) => handleInputChange(e, true)}
                  placeholder="Search another company"
                />
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