import React from "react";
import { BettingOutcome } from "../models/types";

interface Props {
  outcome: BettingOutcome;
  onUpdate: (name: string, odds: string) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}
export const OutcomeInput: React.FC<Props> = ({
  outcome,
  onUpdate,
  onRemove,
  canRemove,
}) => (
  <div className="outcome-row">
    <input
      value={outcome.name}
      placeholder="Outcome name"
      onChange={(e) => onUpdate(e.target.value, outcome.odds)}
      style={{ minWidth: 100 }}
    />
    <input
      value={outcome.odds}
      placeholder="Odds (e.g. +150, -120)"
      onChange={(e) => onUpdate(outcome.name, e.target.value)}
      style={{ minWidth: 80 }}
    />
    {canRemove && (
      <button onClick={onRemove} style={{ background: "#ff6b6b" }}>
        −
      </button>
    )}
  </div>
);