// AnalysePage.js
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AnalysePage = ({ data }) => {
  const { stats, averages, criticalPatients } = data || {};
  const [mlPrediction, setMlPrediction] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [allPatients, setAllPatients] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/patients")
      .then((res) => res.json())
      .then((patients) => {
        setAllPatients(patients);
      })
      .catch((err) => console.error("Hasta verisi alınamadı:", err));
  }, []);

  useEffect(() => {
    const getPrediction = async () => {
      if (Array.isArray(criticalPatients) && criticalPatients.length > 0) {
        const randomPatient =
          criticalPatients[Math.floor(Math.random() * criticalPatients.length)];

        const payload = buildMLPayload(randomPatient);

        try {
          const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const result = await response.json();
          setMlPrediction({
            prediction: result.prediction,
            patient: randomPatient,
          });
        } catch (error) {
          console.error("Prediction error:", error);
          setMlPrediction({ prediction: "Error" });
        }
      }
    };

    getPrediction();
  }, [criticalPatients]);

  const handlePrediction = async () => {
    if (!selectedPatient) return;

    const selected = allPatients.find((p) => String(p.encounterId) === selectedPatient);
    if (!selected) {
      setSelectedPrediction("Patient not found.");
      return;
    }

    const payload = buildMLPayload(selected);

    //  Debug logs:
    console.log("Selected patient data:", selected);
    console.log("Payload being sent to FastAPI:", payload);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setSelectedPrediction(result.prediction);
    } catch (error) {
      setSelectedPrediction("Prediction failed.");
    }
  };

  //  16 özellikli doğru tahmin payload'u
  const buildMLPayload = (patient) => {
    const fullFeatureList = [
      "end_tidal_co2", "feed_vol", "feed_vol_adm", "fio2", "fio2_ratio",
      "insp_time", "oxygen_flow_rate", "peep", "pip", "resp_rate", "sip",
      "tidal_vol", "tidal_vol_actual", "tidal_vol_kg", "tidal_vol_spon", "bmi"
    ];

    const payload = {};
    fullFeatureList.forEach((key) => {
      payload[key] = parseFloat(patient[key]) || 0;
    });

    return payload;
  };

  const safeAverages = Array.isArray(averages)
    ? averages.filter(
        (item) =>
          typeof item.name === "string" &&
          typeof item.value === "number" &&
          !isNaN(item.value)
      )
    : [];

  const chartData = {
    labels: safeAverages.map((item) => item.name),
    datasets: [
      {
        label: "Average Value",
        data: safeAverages.map((item) => item.value),
        backgroundColor: "rgba(0, 123, 255, 0.6)",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const tidalVolData = safeAverages.filter((item) =>
    ["TIDAL VOL", "TIDAL VOL ACTUAL"].includes(item.name)
  );

  const comparisonData = {
    labels: tidalVolData.map((item) => item.name),
    datasets: [
      {
        label: "Comparison",
        data: tidalVolData.map((item) => item.value),
        backgroundColor: ["#28a745", "#ffc107"],
        borderRadius: 6,
      },
    ],
  };

  const bmiHigh = criticalPatients.filter((p) => parseFloat(p.bmi) > 35).length;
  const highResp = criticalPatients.filter((p) => parseFloat(p.resp_rate) > 30).length;
  const highOxy = criticalPatients.filter((p) => parseFloat(p.oxygen_flow_rate) > 10).length;

  return (
    <div
      style={{
        background: "#fff",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        maxHeight: "calc(100vh - 40px)",
        overflowY: "auto",
      }}
    >
      <h2>Patient Data Analysis</h2>

      {!stats ? (
        <p>Loading...</p>
      ) : (
        <ul>
          <li><strong>Average BMI:</strong> {String(stats.avgBMI)}</li>
          <li><strong>Min Oxygen Flow Rate:</strong> {String(stats.minOxygen)}</li>
          <li><strong>Max Oxygen Flow Rate:</strong> {String(stats.maxOxygen)}</li>
          <li><strong>Average Respiratory Rate:</strong> {String(stats.avgRespRate)}</li>
          <li><strong>Total Patients Referred:</strong> {String(stats.referralCount)}</li>
        </ul>
      )}

      {(bmiHigh > 0 || highResp > 0 || highOxy > 0) && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            borderRadius: "8px",
            color: "#856404",
          }}
        >
          <h3>⚠️ Insights & Warnings</h3>
          <ul>
            {bmiHigh > 0 && (
              <>
                <li>⚠️ High average BMI detected. Monitor patients for obesity-related risks.</li>
                <li>{bmiHigh} patient(s) have BMI over 35</li>
              </>
            )}
            {highResp > 0 && (
              <>
                <li>⚠️ High respiratory rate in some patients. Consider checking for distress.</li>
                <li>{highResp} patient(s) have respiratory rate over 30</li>
              </>
            )}
            {highOxy > 0 && (
              <>
                <li>⚠️ High oxygen support detected. Some patients may require close monitoring.</li>
                <li>{highOxy} patient(s) have oxygen flow rate over 10</li>
              </>
            )}
          </ul>
        </div>
      )}

      {mlPrediction && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#e8f5e9",
            border: "1px solid #c8e6c9",
            borderRadius: "8px",
            color: "#256029",
          }}
        >
          <h3>Machine Learning Prediction</h3>
          <p>
            Randomly selected critical patient (ID: <strong>{mlPrediction.patient?.encounterId}</strong>) prediction:{" "}
            <strong>{mlPrediction.prediction === 1 ? "Needs Dietitian Referral" : "Does NOT Need Referral"}</strong>
          </p>
        </div>
      )}

      {allPatients.length > 0 && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#f0f4ff",
            border: "1px solid #b6d4fe",
            borderRadius: "8px",
            color: "#084298",
          }}
        >
          <h3>🔍 Predict for Selected Patient</h3>
          <select
            value={selectedPatient || ""}
            onChange={(e) => setSelectedPatient(e.target.value)}
            style={{ marginRight: "10px", padding: "6px", borderRadius: "4px" }}
          >
            <option value="" disabled>Select a patient</option>
            {allPatients.map((p) => (
              <option key={p.encounterId} value={p.encounterId}>
                ID: {p.encounterId}
              </option>
            ))}
          </select>
          <button
            onClick={handlePrediction}
            style={{
              padding: "6px 12px",
              border: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Predict
          </button>
          {selectedPrediction !== null && (
            <p style={{ marginTop: "10px" }}>
              Selected patient prediction:{" "}
              <strong>{selectedPrediction === 1 ? "Needs Dietitian Referral" : "Does NOT Need Referral"}</strong>
            </p>
          )}
        </div>
      )}

      {safeAverages.length > 0 ? (
        <div
          style={{
            marginTop: "40px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            backgroundColor: "#fff",
          }}
        >
          <h3>Average Values</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p>No average data available to display</p>
      )}

      {tidalVolData.length === 2 && (
        <div
          style={{
            marginTop: "40px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            backgroundColor: "#fff",
          }}
        >
          <h3>TIDAL VOL vs TIDAL VOL ACTUAL</h3>
          <Bar data={comparisonData} options={chartOptions} />
        </div>
      )}

      {Array.isArray(criticalPatients) && criticalPatients.length > 0 && (
        <>
          <h3 style={{ marginTop: "40px" }}>⚠️ Critical Patients</h3>
          <table
            border="1"
            cellPadding="8"
            style={{
              borderCollapse: "collapse",
              width: "100%",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr>
                <th>Encounter ID</th>
                <th>Resp Rate</th>
                <th>Oxygen Flow Rate</th>
                <th>BMI</th>
              </tr>
            </thead>
            <tbody>
              {criticalPatients.map((p, i) => (
                <tr key={i}>
                  <td>{p.encounterId}</td>
                  <td>{p.resp_rate}</td>
                  <td>{p.oxygen_flow_rate}</td>
                  <td>{p.bmi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default AnalysePage;
