import React, { useState, useEffect } from 'react';
import './ESGForm.css';
import companiesData from './companies.json'; 
import axios from 'axios';

axios.defaults.withCredentials = true;

const ESGForm = () => {
  const [companies, setCompanies] = useState(companiesData);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
      // Load the company data from the JSON file
    const fetchData = async () => {
      try {
        const apiURL = "http://9900.seasite.top:8000/app/locations/";
        const response = await axios.get(apiURL, { withCredentials: true });
        console.log(response.data);
        if(response.data.companies){
          setCompanies(response.data.companies);
          setLocations(response.data);
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
      <div className="location-links">
        <h2>Locations</h2>
          <ul>
            {locations.map((location, index) => (
              <li key={index}>
                <a href={location.url} target="_blank" rel="noopener noreferrer">
                  {location.name}
                </a>
              </li>
            ))}
          </ul>
      </div>
    </form>
    
  );
};

export default ESGForm;
