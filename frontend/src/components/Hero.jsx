import React from 'react';

export default function Hero({ collapsed }) {
  if (collapsed) {
    return (
      <div style={{ position: "relative", zIndex: 1 }} className="text-center small text-body-secondary py-2">
        Clean, map and load your data
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1 }} className="text-center py-4">
      <h2 className="text-info fw-semibold mb-2">Clean, map and load your data</h2>
      <p className="text-body-secondary mb-0">Upload a CSV or JSON file to begin. Nothing changes until you choose.</p>
    </div>
  );
}
