// ESGForm.js
import React from 'react';
import './ESGForm.css';


const ESGForm = () => {
  return (
    <form className="esg-form">
      <div className="input-group">
        <label>Company Name</label>
        <input type="text" placeholder="XXX Company" />
        <label>Framework</label>
        <input type="text" placeholder="XXX Company" />
        <label>Year</label>
        <input type="text" placeholder="XXX Company" />
      </div>
      {/* Add other input groups for standard and year */}
      {/* Add buttons for reset weights and add another company */}
    </form>
  );
};

export default ESGForm;
