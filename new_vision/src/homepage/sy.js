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

return (
  <div className="table-responsive">
      <table className="table table-hover">
          <thead className="thead-dark">
              <tr>
                  <th>Company names</th>
                  <th colSpan="2">{company1} ({year1})</th>
                  <th colSpan="2">{company2} ({year2})</th>
              </tr>
          </thead>
          <tbody>
          <tr>
              <td className="esg-score">ESG Score</td>
              <td colSpan="2" className="esg-score-cell">{esgScore1 !== null ? esgScore1 : 'Loading'}</td>
              <td colSpan="2" className="esg-score-cell">{esgScore2 !== null ? esgScore2 : 'Loading'}</td>
          </tr>
              {data.metrics.map((metric) => (
                  <React.Fragment key={metric.id}>
                      <tr onClick={() => toggleMetric(metric.id)}>
                          <td>{metric.name}</td>
                          <td colSpan="4">Click to view details</td>
                      </tr>
                      {openMetrics[metric.id] && (
                          <>
                              <tr>
                                  <td colSpan="5">
                                      <Line
                                          data={metric.data}
                                          width={400}
                                          height={200}
                                          options={{ maintainAspectRatio: false }}
                                      />
                                  </td>
                              </tr>
                              <tr>
                                  <td colSpan="5">
                                      <table className="table">
                                          <thead>
                                              <tr>
                                                  <th>Indicators</th>
                                                  <th>{company1} ({year1})</th>
                                                  <th>{company2} ({year2})</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                              {metric.indicators && Object.keys(metric.indicators).map(key => (
                                                  <tr key={key}>
                                                      <td>{key}</td>
                                                      <td>{metric.indicators[key][0]}</td>
                                                      <td>{metric.indicators[key][1]}</td>
                                                  </tr>
                                              ))}
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </>
                      )}
                  </React.Fragment>
              ))}
          </tbody>
      </table>
  </div>
);