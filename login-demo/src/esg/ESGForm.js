import React from 'react';
import './ESGForm.css';

const ESGForm = () => {
  return (
    <form className="esg-form">
      <div className="input-group">
        <label>Company Name</label>
        <input type="search" list="company-options" placeholder="Search Company" />
        <datalist id="company-options">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
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
