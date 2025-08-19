import React from "react";

export const PremiumModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Premium Features</h2>
        <p>Unlock advanced arbitrage opportunities:</p>
        <ul>
          <li>🏇 Horse Racing (coming soon)</li>
          <li>🏎️ Car Racing (coming soon)</li>
          <li>⚽ Soccer Markets (coming soon)</li>
          <li>📊 Advanced Analytics (coming soon)</li>
        </ul>
        <button disabled style={{ background: "#ffb84d" }}>
          Coming Soon
        </button>
        <button onClick={onClose} style={{ marginLeft: 12 }}>
          Close
        </button>
      </div>
    </div>
  );
};