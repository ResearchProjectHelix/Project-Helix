import React from "react";

export default function CompletenessRing({ percentage = 0 }) {
  const radius = 54;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  function getColor(pct) {
    if (pct >= 80) return "#4caf7d"; // success
    if (pct >= 50) return "#e0a23b"; // warning
    return "#e05b5b"; // critical
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg height={radius * 2} width={radius * 2}>
        {/* background ring */}
        <circle
          stroke="#262b38"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* progress ring */}
        <circle
          stroke={getColor(percentage)}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            transition: "stroke-dashoffset 0.6s ease",
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      </svg>

      <div style={{ marginTop: "-78px", textAlign: "center" }}>
        <div style={{ fontSize: "1.6rem", fontWeight: 600 }}>
          {percentage}%
        </div>
        <div style={{ fontSize: "0.75rem", color: "#9aa0ad" }}>
          Clinical Completeness
        </div>
      </div>
    </div>
  );
}