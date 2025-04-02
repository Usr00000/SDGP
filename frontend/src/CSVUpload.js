import React, { useState } from "react";

const CSVUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadStatus("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadStatus("success");
      } else {
        setUploadStatus("fail");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("fail");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload Patient Data</h2>
      <div style={styles.formGroup}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={styles.fileInput}
        />
        <button onClick={handleUpload} style={styles.uploadButton}>
          Upload CSV
        </button>
      </div>
      {uploadStatus === "success" && (
        <p style={styles.successMessage}>
          File uploaded successfully 
        </p>
      )}
      {uploadStatus === "fail" && (
        <p style={styles.errorMessage}>
          File upload failed 
        </p>
      )}
      {uploadStatus && uploadStatus !== "success" && uploadStatus !== "fail" && (
        <p style={styles.neutralMessage}>{uploadStatus}</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: "#fff",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
    margin: "0 auto",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  formGroup: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },
  fileInput: {
    padding: "6px 10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  uploadButton: {
    padding: "8px 16px",
    backgroundColor: "#38d9a9",
    border: "none",
    borderRadius: "4px",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  successMessage: {
    color: "green",
    fontWeight: "bold",
  },
  errorMessage: {
    color: "red",
    fontWeight: "bold",
  },
  neutralMessage: {
    color: "#555",
  },
};

export default CSVUpload;
