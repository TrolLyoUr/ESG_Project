// FrameworkChoose.js
import React, {useState, useEffect} from "react";
import axios from "axios";
import "./FrameworkChoose.css";
import {SERVER_URL} from "./config"; // Make sure the constant is correctly named

const serverUrl = SERVER_URL; // Make sure the constant is correctly named
axios.defaults.withCredentials = true;
const FrameworkChoose = ({setFramework}) => {
    const [frameworks, setFrameworks] = useState([]);
    const [activeDescriptionId, setActiveDescriptionId] = useState(null);

    useEffect(() => {
        const fetchFrameworks = async () => {
            try {
                const response = await axios.get(`${serverUrl}/app/frameworks/`, {withCredentials: true});
                setFrameworks(response.data); // Set frameworks based on the API response
            } catch (error) {
                console.error("Failed to fetch frameworks:", error);
            }
        };

        fetchFrameworks();
    }, []);

    const toggleDescription = (id) => {
        setActiveDescriptionId(activeDescriptionId === id ? null : id); // Toggle active description
    };

    const handleFrameworkSelection = (frameworkId) => {
        setFramework(frameworkId); // Pass the frameworkId to the setFramework function provided by the parent
        setActiveDescriptionId(null); // Optionally hide the description when a new framework is selected
    };

    const renderDescription = (description) => {
        // Split the description by line breaks and render each line separately
        return description.split(/\r?\n/).map((line, index) => (<React.Fragment key={index}>
            {line}
            <br/>
        </React.Fragment>));
    };

    return (<div className="framework-choose">
        {frameworks.map((framework) => (<div key={framework.id} className="framework-item">
            <button onClick={() => handleFrameworkSelection(framework.id)}>
                {framework.name}
            </button>
            <span
                className="triangle-icon"
                onClick={() => toggleDescription(framework.id)}
            >
            ▼
          </span>
            {activeDescriptionId === framework.id && (<div className="framework-description">
                {renderDescription(framework.description)}
            </div>)}
        </div>))}
    </div>);
};

export default FrameworkChoose;
