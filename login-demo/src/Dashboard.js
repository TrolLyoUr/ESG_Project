import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; 

const MyESG = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [framework, setFramework] = useState('');
  const [year, setYear] = useState('');
  const companies = ['1', '2', '3']; 
  const [filteredCompanies, setFilteredCompanies] = useState([]);

  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim()) {
      setFilteredCompanies(companies.filter(company => company.includes(term)));
    } else {
      setFilteredCompanies([]);
    }
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setSearchTerm(company);
    setFilteredCompanies([]);
  };

  const handleConfirm = () => {
    
    console.log(`Selected company: ${selectedCompany}, framework: ${framework}, year: ${year}`);
    navigate('/esg');
  };

  return (
    <div className="my-esg">
      <header className="header">
        <h1>My ESG</h1>
        <div className="logo">
          {/* Your ESG logo here */}
        </div>
      </header>
      <div className="search-area">
        <input
          type="text"
          placeholder="Search the company..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <ul className="search-results">
            {filteredCompanies.map((company, index) => (
              <li key={index} onClick={() => handleSelectCompany(company)}>
                {company}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="filters">
        <select value={framework} onChange={(e) => setFramework(e.target.value)}>
          <option value="">Select framework...</option>
          <option value="GRI">GRI</option>
          <option value="SASB">SASB</option>
          <option value="TCFD">TCFD</option>
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Select year...</option>
          <option value="2022">2022</option> 
          <option value="2023">2023</option> 
          <option value="2024">2024</option> 
        
        </select>
        <button onClick={handleConfirm}>Confirm</button> 
      </div>
      <footer className="footer">
        <span>Copyright Reserved @2024</span>
        <nav>
          <p>Terms and Conditions | Privacy Policy</p>
        </nav>
      </footer>
    </div>
  );
};

export default MyESG;
