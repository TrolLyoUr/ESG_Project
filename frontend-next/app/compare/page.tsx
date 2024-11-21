"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FrameworkChoose from "@/components/comparepage/FrameworkChoose";
import ComparisonTable from "@/components/comparepage/ComparisonTable";
import Link from "next/link";

interface CompareParams {
  company1: string;
  year1: string;
  company2: string;
  year2: string;
  companyid1: string;
  companyid2: string;
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [framework, setFramework] = useState<number>(4);
  const [params, setParams] = useState<CompareParams>({
    company1: "",
    year1: "",
    company2: "",
    year2: "",
    companyid1: "",
    companyid2: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract and validate URL parameters
    const company1 = searchParams.get("company1");
    const year1 = searchParams.get("year1");
    const company2 = searchParams.get("company2");
    const year2 = searchParams.get("year2");
    const companyid1 = searchParams.get("companyid1");
    const companyid2 = searchParams.get("companyid2");

    // Validate required parameters
    if (
      !company1 ||
      !year1 ||
      !company2 ||
      !year2 ||
      !companyid1 ||
      !companyid2
    ) {
      setError("Missing required parameters for comparison");
      return;
    }

    setParams({
      company1,
      year1,
      company2,
      year2,
      companyid1,
      companyid2,
    });
  }, [searchParams]);

  const handleFrameworkChange = (frameworkId: number) => {
    setFramework(frameworkId);
  };

  if (error) {
    return (
      <div className="compare-error-container">
        <div className="error-message">
          <h2>Error Loading Comparison</h2>
          <p>{error}</p>
          <Link href="/" className="back-button">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (!params.company1 || !params.company2) {
    return (
      <div className="compare-loading">
        <div className="loading-spinner"></div>
        <p>Loading comparison data...</p>
      </div>
    );
  }

  return (
    <div className="compare-page">
      <div className="compare-header">
        <h1>ESG Performance Comparison</h1>
        <div className="companies-info">
          <div className="company-detail">
            <h3>{params.company1}</h3>
            <p>Year: {params.year1}</p>
          </div>
          <div className="vs-badge">VS</div>
          <div className="company-detail">
            <h3>{params.company2}</h3>
            <p>Year: {params.year2}</p>
          </div>
        </div>
      </div>

      <div className="framework-section">
        <FrameworkChoose
          setFramework={handleFrameworkChange}
          initialFramework={framework}
        />
      </div>

      <div className="comparison-section">
        <ComparisonTable
          company1={params.company1}
          year1={params.year1}
          company2={params.company2}
          year2={params.year2}
          companyid1={params.companyid1}
          companyid2={params.companyid2}
          framework={framework}
        />
      </div>

      <div className="compare-actions">
        <Link href="/" className="back-button">
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
