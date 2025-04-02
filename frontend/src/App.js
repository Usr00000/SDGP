import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CSVUpload from "./CSVUpload";
import PatientsTable from "./PatientsTable";
import AnalysePage from "./AnalysePage";
import "./App.css";

const HomePage = () => (
  <div className="home-container">
    <div className="home-card">
      <h1 className="home-title">Welcome to the Feeding Dashboard</h1>
      <p className="home-text">
        This dashboard helps you manage, analyze and review patient feeding data.
        Use the sidebar to upload, view or analyze patient records.
      </p>
    </div>
  </div>
);

const HelpPage = () => (
  <div className="content-box">
    <h2>Help</h2>
    <p>If you need assistance, contact the administrator.</p>
  </div>
);

const App = () => {
  const [patients, setPatients] = useState([]); // tüm hastaları burada tut
  const [stats, setStats] = useState(null);
  const [averages, setAverages] = useState([]);
  const [criticalPatients, setCriticalPatients] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/patients")
      .then((res) => res.json())
      .then((data) => {
        console.log("Gelen veri:", data);
        if (!Array.isArray(data)) {
          console.error("Beklenmeyen veri formatı:", data);
          return;
        }

        setPatients(data); //  tüm hastaları state'e kaydet
        setStats(calculateStats(data));
        setAverages(calculateAverages(data));
        setCriticalPatients(filterCritical(data));
      })
      .catch((err) => {
        console.error("Veri çekme hatası:", err);
      });
  }, []);

  const calculateStats = (data) => {
    const totalBMI = data.reduce((sum, p) => sum + (parseFloat(p.bmi) || 0), 0);
    const avgBMI = (totalBMI / data.length).toFixed(2);
    const oxygenValues = data.map((p) => parseFloat(p.oxygen_flow_rate) || 0);
    const minOxygen = Math.min(...oxygenValues);
    const maxOxygen = Math.max(...oxygenValues);
    const totalRespRate = data.reduce((sum, p) => sum + (parseFloat(p.resp_rate) || 0), 0);
    const avgRespRate = (totalRespRate / data.length).toFixed(2);
    const referralCount = data.filter((p) => p.referral === 1 || p.referral === "1").length;

    return { avgBMI, minOxygen, maxOxygen, avgRespRate, referralCount };
  };

  const calculateAverages = (data) => {
    const fieldsToAverage = ["bmi", "fio2", "fio2_ratio", "tidal_vol", "tidal_vol_actual", "tidal_vol_kg"];
    return fieldsToAverage.map((field) => {
      const values = data.map((p) => parseFloat(p[field]) || 0);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return {
        name: field.replace(/_/g, " ").toUpperCase(),
        value: isNaN(avg) ? 0 : parseFloat(avg.toFixed(2)),
      };
    });
  };

  const filterCritical = (data) => {
    return data.filter((p) => {
      const resp = parseFloat(p.resp_rate) || 0;
      const oxy = parseFloat(p.oxygen_flow_rate) || 0;
      const bmi = parseFloat(p.bmi) || 0;
      return resp > 30 || oxy > 10 || bmi > 35;
    });
  };

  return (
    <Router>
      <div className="container">
        <div className="sidebar">
          <h2 className="sidebar-title">Dashboard</h2>
          <nav>
            <ul className="nav-list">
              <li><Link className="nav-link" to="/">Homepage</Link></li>
              <li><Link className="nav-link" to="/upload">Upload Patient Data</Link></li>
              <li><Link className="nav-link" to="/view">View Patient Data</Link></li>
              <li><Link className="nav-link" to="/analyse">Analyse Patient Data</Link></li>
              <li><Link className="nav-link" to="/help">Help</Link></li>
            </ul>
          </nav>
        </div>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<CSVUpload />} />
            <Route path="/view" element={<PatientsTable />} />
            <Route
              path="/analyse"
              element={
                <AnalysePage
                  data={{
                    stats,
                    averages,
                    criticalPatients,
                    allPatients: patients, // burası eklendi
                  }}
                />
              }
            />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
