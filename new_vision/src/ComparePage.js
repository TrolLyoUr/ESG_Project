import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 引入 useNavigate
import FrameworkChoose from './comparepage/FrameworkChoose';
import ComparisonTable from './comparepage/ComparisonTable';

const ComparePage = () => {
    const location = useLocation();
    const navigate = useNavigate(); // 使用 useNavigate 钩子

    const queryParams = new URLSearchParams(location.search);
    const company1 = queryParams.get('company1');
    const year1 = queryParams.get('year1');
    const company2 = queryParams.get('company2');
    const year2 = queryParams.get('year2');
    const companyid1 = queryParams.get('companyid1');
    const companyid2 = queryParams.get('companyid2');
    const [framework, setFramework] = useState(4);

    const handleFrameworkChange = (frameworkId) => {
        setFramework(frameworkId);
    };

    // 返回主界面的函数
    const handleBack = () => {
        navigate('/'); // 用于导航到主界面
    };

    return (
        <div>
            <FrameworkChoose setFramework={handleFrameworkChange} />
            <ComparisonTable
                company1={company1}
                year1={year1}
                company2={company2}
                year2={year2}
                companyid1={companyid1}
                companyid2={companyid2}
                framework={framework}
            />
            {/* 添加返回按钮 */}
            <button onClick={handleBack}>Back To Mainpage</button>
        </div>
    );
};

export default ComparePage;
