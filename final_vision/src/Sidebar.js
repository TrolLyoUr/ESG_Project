import React, { useState } from 'react';
import './Sidebar.css';
import axios from 'axios';

axios.defaults.withCredentials = true;

const Sidebar = ({ isOpen }) => {
    const sidebarClasses = `sidebar ${isOpen ? 'open' : 'hidden'}`;
    const [selectedCompany, setSelectedCompany] = useState('');
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [isComparing, setIsComparing] = useState(false); // State to track comparison feature
    const [selectedCompany2, setSelectedCompany2] = useState(''); // Second company
    const [selectedYear2, setSelectedYear2] = useState(''); // Second year

    const handleInputChange = async (e, isSecondCompany = false) => {
        const value = e.target.value.trim();
        if (!isSecondCompany) {
            setSelectedCompany(value);
        } else {
            setSelectedCompany2(value);
        }
    
        if (value.length >= 1) {
            try {
                const apiURL = `http://9900.seasite.top:8000/app/fsearch/${value}/`;
                const response = await axios.get(apiURL, { withCredentials: true });
                const companyName = response.data.map(company => company.name);
                if (!isSecondCompany) {
                    setFilteredCompanies(companyName);
                } else {
                    // You might need a separate state to handle filtered companies for the second input
                }
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
    

    const toggleCompare = () => setIsComparing(!isComparing);

    return (
        <div className={sidebarClasses}>
            <div className="sidebar-header">
                <div className="logo">
                    <img src="/esglogoopy.png" alt="Logo" style={{ width: '200px', height: '200px' }} />
                </div>
                <ul>
                    <li>
                        <label className="label" htmlFor="company">Company</label>
                        <input
                            className="input"
                            list="company-options"
                            id="company"
                            value={selectedCompany}
                            onChange={(e) => handleInputChange(e)}
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
                        <select className="select" id="year" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                            <option value="" disabled hidden>Choose a year</option>
                            <option value="2021">2021</option>
                            <option value="2022">2022</option>
                            <option value="2023">2023</option>
                        </select>
                    </li>
                    {/* Compare button */}
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
                                    onChange={(e) => handleInputChange(e, true)}
                                    placeholder="Search another company"
                                />
                                {/* You might need a separate datalist for the second company */}
                                <datalist id="company-options2">
                                    {/* Map over second company's filtered companies */}
                                </datalist>
                            </li>
                            <li>
                                <label className="label" htmlFor="year2">Year</label>
                                <select className="select" id="year2" value={selectedYear2} onChange={e => setSelectedYear2(e.target.value)}>
                                    <option value="" disabled hidden>Choose a year</option>
                                    <option value="2021">2021</option>
                                    <option value="2022">2022</option>
                                    <option value="2023">2023</option>
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
