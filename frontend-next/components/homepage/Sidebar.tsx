"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { SERVER_URL } from "@/lib/config";
import Image from "next/image";
import "./Sidebar.css";

interface SidebarProps {
  isOpen: boolean;
  setCompanyId: (id: string) => void;
  setYear: (year: string) => void;
  setCompanyname: (name: string) => void;
}

interface Company {
  id: string;
  name: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setCompanyId,
  setYear,
  setCompanyname,
}) => {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [selectedCompany2, setSelectedCompany2] = useState("");
  const [filteredCompanies2, setFilteredCompanies2] = useState<Company[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedYear2, setSelectedYear2] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [companyId, setCompanyIdState] = useState("");
  const [companyId2, setCompanyId2] = useState("");

  // Fetch years on component mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        console.log(SERVER_URL);
        const response = await axios.get(`${SERVER_URL}/app/years/`, {
          withCredentials: true,
        });
        setYears(response.data.map((item: { year: string }) => item.year));
      } catch (error) {
        console.error("Failed to fetch years:", error);
      }
    };

    fetchYears();
  }, []);

  // Set companyId when filteredCompanies changes
  useEffect(() => {
    if (filteredCompanies.length > 0) {
      setCompanyIdState(filteredCompanies[0].id);
    }
  }, [filteredCompanies]);

  // Set companyId2 when filteredCompanies2 changes
  useEffect(() => {
    if (filteredCompanies2.length > 0) {
      setCompanyId2(filteredCompanies2[0].id);
    }
  }, [filteredCompanies2]);

  // Handle comparison navigation
  useEffect(() => {
    if (
      isComparing &&
      selectedCompany &&
      selectedCompany2 &&
      selectedYear &&
      selectedYear2
    ) {
      const params = {
        company1: selectedCompany,
        year1: selectedYear,
        companyid1: companyId,
        company2: selectedCompany2,
        year2: selectedYear2,
        companyid2: companyId2,
      };

      const queryString = new URLSearchParams(params).toString();
      router.push(`/compare?${queryString}`);
    }
  }, [
    selectedCompany,
    selectedCompany2,
    companyId,
    companyId2,
    selectedYear,
    selectedYear2,
    isComparing,
    router,
  ]);

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isSecondCompany = false
  ) => {
    const value = e.target.value.trim();
    if (isSecondCompany) {
      setSelectedCompany2(value);
    } else {
      setSelectedCompany(value);
    }

    if (value.length >= 1) {
      try {
        const response = await axios.get(
          `${SERVER_URL}/app/fsearch/${value}/`,
          { withCredentials: true }
        );
        const companies = response.data.map((company: Company) => ({
          name: company.name,
          id: company.id,
        }));
        if (isSecondCompany) {
          setFilteredCompanies2(companies);
        } else {
          setFilteredCompanies(companies);
        }
      } catch (error) {
        console.error("Failed to fetch filtered companies:", error);
      }
    } else {
      if (isSecondCompany) {
        setFilteredCompanies2([]);
      } else {
        setFilteredCompanies([]);
      }
    }
  };

  const finalizeSelection = () => {
    const company = filteredCompanies.find((c) => c.name === selectedCompany);
    if (company) {
      setCompanyId(company.id);
      setCompanyname(company.name);
    }
  };

  const toggleCompare = () => setIsComparing(!isComparing);

  return (
    <div className={`sidebar ${isOpen ? "open" : "hidden"}`}>
      <div className="sidebar-header">
        <div className="logo">
          <Image
            src="/static/esglogoopy.png"
            alt="Logo"
            width={200}
            height={200}
            priority
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
                <datalist id="company-options2">
                  {filteredCompanies2.map((company2, index) => (
                    <option key={index} value={company2.name} />
                  ))}
                </datalist>
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
