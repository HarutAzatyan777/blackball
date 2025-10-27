// src/components/AnalyticsDashboard.jsx
import React from "react";

export default function AnalyticsDashboard() {
  return (
    <div
      style={{
        width: "100%",
        height: "90vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8f9fb",
      }}
    >
      <iframe
        src="https://lookerstudio.google.com/reporting/375dfa87-49c7-4c70-9353-616ca3440894"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        title="Google Analytics Dashboard"
        style={{
          border: "none",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
        }}
      ></iframe>
    </div>
  );
}
