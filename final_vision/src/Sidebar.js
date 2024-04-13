import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import axios from "axios";
import { SEVER_URL } from "./config";

const serverUrl = SEVER_URL;
axios.defaults.withCredentials = true;

const Sidebar = ({ isOpen }) => {
  const sidebarClasses = `sidebar ${isOpen ? "open" : "hidden"}`;
  const [selectedCompany, setSelectedCompany] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [years, setYears] = useState([]); // State for storing the list of years
  const [selectedYear, setSelectedYear] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [selectedCompany2, setSelectedCompany2] = useState("");
  const [selectedYear2, setSelectedYear2] = useState("");

  useEffect(() => {
    // Fetch years when the component mounts
    const fetchYears = async () => {
      try {
        const response = await axios.get(`${serverUrl}/app/years/`);
        setYears(response.data.map((item) => item.year)); // Assume the API returns an array of objects with a year property
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
        const companyName = response.data.map((company) => company.name);
        if (!isSecondCompany) {
          setFilteredCompanies(companyName);
        } else {
          // Handle second company filtered list
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
