import React, { useState,useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FrameworkChoose from './comparepage/FrameworkChoose'; // 确保路径正确
import ComparisonTable from './comparepage/ComparisonTable'; 

const ComparePage = () => {
    const location = useLocation();

    // 使用 URLSearchParams 来解析查询字符串
    const queryParams = new URLSearchParams(location.search);
    const company1 = queryParams.get('company1');
    const year1 = queryParams.get('year1');
    const company2 = queryParams.get('company2');
    const year2 = queryParams.get('year2');
    const companyid1 = queryParams.get('companyid1');
    const companyid2 = queryParams.get('companyid2');
    const [framework, setFramework] = useState(4); // 初始状态为空或根据需要设置默认值

    // 更新框架的处理函数
    const handleFrameworkChange = (frameworkId) => {
        setFramework(frameworkId);
        // 这里可以添加其他逻辑，如发送请求或更新其他状态
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
        </div>
    );
};

export default ComparePage;
