"use client";

import { useState } from "react";
import Sidebar from "@/components/homepage/Sidebar";
import TotalScore from "@/components/homepage/TotalScore";
import FrameworkChoose from "@/components/homepage/FrameworkChoose";
import MetricsCard from "@/components/homepage/MetricsCard";
import ChartsContainer from "@/components/homepage/ChartsContainer";
import type { Profile } from "@/types";

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    company: "",
    year: "",
    framework: "",
    companyName: "",
    selectedMetrics: [],
    weight: 0,
  });

  const handleProfileChange = (key: keyof Profile, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const contentStyle = {
    marginLeft: isSidebarOpen ? "270px" : "0",
    width: "100%",
    transition: "margin-left 0.3s, width 0.3s",
  };

  const featureBarsStyle = {
    marginLeft: isSidebarOpen ? "270px" : "0",
    marginTop: "20px",
    transition: "margin-left 0.3s",
  };

  return (
    <div className="content-area" style={contentStyle}>
      <div className="feature-bars" style={featureBarsStyle}>
        <TotalScore
          companyId={profile.company}
          year={profile.year}
          frameworkId={profile.framework}
          weight={profile.weight}
        />
        <FrameworkChoose
          setFramework={(framework) =>
            handleProfileChange("framework", framework)
          }
        />
        <MetricsCard
          currentFramework={profile.framework}
          selectedYear={profile.year}
          selectedCompany={profile.company}
          setSelectedMetrics={(metrics) =>
            handleProfileChange("selectedMetrics", metrics)
          }
          setWeight={(weight) => handleProfileChange("weight", weight)}
        />
        <ChartsContainer
          companyId={profile.company}
          year={profile.year}
          frameworkId={profile.framework}
          companyname={profile.companyName}
        />
      </div>
      <Sidebar
        isOpen={isSidebarOpen}
        setCompanyId={(company) => handleProfileChange("company", company)}
        setYear={(year) => handleProfileChange("year", year)}
        setCompanyname={(companyName) =>
          handleProfileChange("companyName", companyName)
        }
      />
    </div>
  );
}
