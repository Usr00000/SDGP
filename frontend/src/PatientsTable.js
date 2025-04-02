import React, { useEffect, useState } from "react";

const PatientsTable = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedPatient, setSelectedPatient] = useState(null); // Modal için

  useEffect(() => {
    fetch("http://127.0.0.1:8000/patients")
      .then((response) => response.json())
      .then((data) => {
        const cleanData = Array.isArray(data) ? data : [];
        setPatients(cleanData);
        setFilteredPatients(cleanData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    if (filter === "All") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter((patient) => {
        const val =
          patient.referral === 1 ||
          patient.referral === "1" ||
          patient.referral === true ||
          patient.referral === "Yes"
            ? "Yes"
            : patient.referral === 0 ||
              patient.referral === "0" ||
              patient.referral === false ||
              patient.referral === "No"
            ? "No"
            : "N/A";
        return val === filter;
      });
      setFilteredPatients(filtered);
    }
  }, [filter, patients]);

  const renderReferralDisplay = (referral) => {
    if (referral === 1 || referral === "1" || referral === true || referral === "Yes") return "Yes";
    if (referral === 0 || referral === "0" || referral === false || referral === "No") return "No";
    return "N/A";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Patient Records</h2>

      {/* Filter Buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontWeight: "bold", fontSize: "16px" }}>
          Filter by Referral Needed:
        </span>
        <button
          onClick={() => setFilter("All")}
          style={{
            backgroundColor: filter === "All" ? "#007bff" : "#e0e0e0",
            color: filter === "All" ? "white" : "black",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter("Yes")}
          style={{
            backgroundColor: filter === "Yes" ? "green" : "#e0e0e0",
            color: filter === "Yes" ? "white" : "black",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Yes
        </button>
        <button
          onClick={() => setFilter("No")}
          style={{
            backgroundColor: filter === "No" ? "red" : "#e0e0e0",
            color: filter === "No" ? "white" : "black",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          No
        </button>
      </div>

      {/* Table Container */}
      <div
        style={{
          maxHeight: "600px",
          overflow: "auto",
          border: "1px solid #ccc",
          borderRadius: "8px",
          background: "#fff",
          padding: "10px",
        }}
      >
        <table
          border="1"
          cellPadding="10"
          style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: "1200px",
          }}
        >
          <thead>
            <tr>
              <th>Encounter ID</th>
              <th>End Tidal CO2</th>
              <th>Feed Vol</th>
              <th>Feed Vol Adm</th>
              <th>FIO2</th>
              <th>FIO2 Ratio</th>
              <th>Insp Time</th>
              <th>Oxygen Flow Rate</th>
              <th>PEEP</th>
              <th>PIP</th>
              <th>Respiratory Rate</th>
              <th>SIP</th>
              <th>Tidal Vol</th>
              <th>Tidal Vol Actual</th>
              <th>Tidal Vol KG</th>
              <th>Tidal Vol Spon</th>
              <th>BMI</th>
              <th>Referral Needed?</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient, index) => {
                const referralDisplay = renderReferralDisplay(patient.referral);
                return (
                  <tr
                    key={index}
                    onClick={() => setSelectedPatient(patient)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{patient.encounterId}</td>
                    <td>{patient.end_tidal_co2}</td>
                    <td>{patient.feed_vol}</td>
                    <td>{patient.feed_vol_adm}</td>
                    <td>{patient.fio2}</td>
                    <td>{patient.fio2_ratio}</td>
                    <td>{patient.insp_time}</td>
                    <td>{patient.oxygen_flow_rate}</td>
                    <td>{patient.peep}</td>
                    <td>{patient.pip}</td>
                    <td>{patient.resp_rate}</td>
                    <td>{patient.sip}</td>
                    <td>{patient.tidal_vol}</td>
                    <td>{patient.tidal_vol_actual}</td>
                    <td>{patient.tidal_vol_kg}</td>
                    <td>{patient.tidal_vol_spon}</td>
                    <td>{patient.bmi}</td>
                    <td
                      style={{
                        color:
                          referralDisplay === "Yes"
                            ? "green"
                            : referralDisplay === "No"
                            ? "red"
                            : "inherit",
                        fontWeight: "bold",
                      }}
                    >
                      {referralDisplay}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="18">No patient data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔄 MODAL DETAYI */}
      {selectedPatient && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedPatient(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ marginBottom: "16px" }}>
              Patient Detail: {selectedPatient.encounterId}
            </h3>

            {/* 🔄 GÜNCELLENMİŞ HASTA BİLGİLERİ */}
            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              {Object.entries(selectedPatient).map(([key, value], i) => {
                if (key === "referral") {
                  const displayValue =
                    value === 1 || value === "1" || value === true || value === "Yes"
                      ? "Yes"
                      : value === 0 || value === "0" || value === false || value === "No"
                      ? "No"
                      : "N/A";
                  return (
                    <li key={i} style={{ marginBottom: "8px" }}>
                      <strong>Referral Needed:</strong> {displayValue}
                    </li>
                  );
                }

                return (
                  <li key={i} style={{ marginBottom: "8px" }}>
                    <strong>{key}:</strong> {value !== null ? value.toString() : "N/A"}
                  </li>
                );
              })}
            </ul>

            <button
              onClick={() => setSelectedPatient(null)}
              style={{
                marginTop: "20px",
                padding: "8px 16px",
                borderRadius: "6px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsTable;
