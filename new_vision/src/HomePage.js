import React, {useState, useEffect} from "react";
import Sidebar from "./homepage/Sidebar";
import TotalScore from "./homepage/TotalScore";
import FrameworkChoose from "./homepage/FrameworkChoose";
import MetricsCard from "./homepage/MetricsCard";
import ChartsContainer from "./homepage/ChartsContainer";

const HomePage = ({isSidebarOpen, toggleSidebar}) => {
    const [profile, setProfile] = useState({
        company: "",
        year: "",
        framework: "",
        companyName: "",
        selectedMetrics: [],
    });

    const handleProfileChange = (key, value) => {
        setProfile((prevProfile) => ({...prevProfile, [key]: value}));
    };

    const contentStyle = {
        marginLeft: isSidebarOpen ? "270px" : "0",
        width: isSidebarOpen ? "100%" : "100%",
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
                    className="feature-bar-item"
                    companyId={profile.company}
                    year={profile.year}
                    frameworkId={profile.framework} // 将 framework 改为 frameworkId
                />
                <FrameworkChoose
                    className="feature-bar-item"
                    setFramework={(framework) =>
                        handleProfileChange("framework", framework)
                    }
                />
                <MetricsCard
                    className="feature-bar-item"
                    currentFramework={profile.framework}
                    selectedYear={profile.year}
                    selectedCompany={profile.company}
                    setSelectedMetrics={(metrics) =>
                        handleProfileChange("selectedMetrics", metrics)
                    }
                />
                <ChartsContainer
                    className="feature-bar-item"
                    companyId={profile.company}
                    year={profile.year}
                    frameworkId={profile.framework}
                    selectedMetrics={profile.selectedMetrics}
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
};

export default HomePage;
