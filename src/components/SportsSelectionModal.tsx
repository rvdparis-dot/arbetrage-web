import React from "react";
import { SportStatus } from "../models/types";

interface Props {
  open: boolean;
  sports: SportStatus[];
  onSelect: (sport: SportStatus) => void;
  onClose: () => void;
}

const groupLabel = (group: string) =>
  group === "Professional"
    ? "Professional Sports"
    : group === "College"
    ? "College Sports"
    : "International & Other";

export const SportsSelectionModal: React.FC<Props> = ({
  open,
  sports,
  onSelect,
  onClose,
}) => {
  if (!open) return null;
  const groups = Array.from(new Set(sports.map((s) => s.group)));
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Import Live Odds</h2>
        {groups.map((group) => (
          <div key={group}>
            <h4>{groupLabel(group)}</h4>
            {sports
              .filter((s) => s.group === group)
              .map((sport) => (
                <div
                  key={sport.key}
                  className={`sport-row ${sport.isActive ? "active" : ""}`}
                  onClick={() => {
                    onSelect(sport);
                    onClose();
                  }}
                  style={{
                    cursor: "pointer",
                    marginBottom: 8,
                    padding: 8,
                    borderRadius: 8,
                    background: sport.isActive
                      ? "#eaffea"
                      : "#efefef",
                  }}
                >
                  <b>{sport.title}</b>{" "}
                  <span style={{ fontSize: 12, color: "#888" }}>
                    {sport.description}
                  </span>
                  <span style={{ float: "right", fontWeight: 600 }}>
                    {sport.isActive ? "LIVE" : "OFF"}
                  </span>
                </div>
              ))}
          </div>
        ))}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};