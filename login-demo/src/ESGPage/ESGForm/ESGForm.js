import React, { useState, useEffect } from 'react';
import './ESGForm.css';
import companiesData from './companies.json'; 
import axios from 'axios';
axios.defaults.withCredentials = true;

const ESGForm = () => {
  const [companies, setCompanies] = useState(companiesData);
  const [message, setMessage] = useState('');

  useEffect(() => {
      // Load the company data from the JSON file
    const fetchData = async () => {
      try {
        const apiURL = "http://127.0.0.1:8000/app/users/";
        const response = await axios.get(apiURL, { withCredentials: true });
        console.log(response);
        setMessage(response.data.message);
        console.log(message);
        console.log(response.data);
        if(response.data.companies){
          setCompanies(response.data.companies)
        }
      } catch (error) {
        console.error('There was an error!', error);
      }
    };
    fetchData();
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
      
      <p>{message}</p>
      {/* Add other input groups for standard and year */}
      {/* Add buttons for reset weights and add another company */}
    </form>
    
  );
};

export default ESGForm;
