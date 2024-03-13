import React, { useState, useEffect } from 'react';
import './ESGForm.css';
import companiesData from './companies.json'; // Assuming the JSON file is saved in the same directory

const ESGForm = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    // Load the company data from the JSON file
    setCompanies(companiesData);
  }, []);

  return (
    <form className="esg-form">
      <div className="input-group">
        <label>Company Name</label>
        <input type="search" list="company-options" placeholder="Search Company" />
        <datalist id="company-options">
          {companies.map((company, index) => (
            <option key={index} value={company.name}>{company.name}</option>
          ))}
        </datalist>

        <label>Framework</label>
        <select>
          <option value="Select Framework">Select Framework</option>
          <option value="GRI">GRI</option>
          <option value="SASB">SASB</option>
          <option value="TCFD">TCFD</option>
        </select>

        <label>Year</label>
        <select>
          <option value="Select Year">Select Year</option>
          <option value="2022">2022</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
        </select>
      </div>
      {/* Add other input groups for standard and year */}
      {/* Add buttons for reset weights and add another company */}
    </form>
  );
};

export default ESGForm;
