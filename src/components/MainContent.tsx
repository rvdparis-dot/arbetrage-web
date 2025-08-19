import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  BettingOutcome,
  ArbitrageResult,
  EventType,
  SportStatus,
} from "../models/types";
import { ArbitrageCalculator } from "../utils/ArbitrageCalculator";
import { OddsConverter } from "../utils/OddsConverter";
import { fetchAvailableSports, fetchOdds } from "../utils/OddsAPIService";
import { Card } from "./Card";
import { OutcomeInput } from "./OutcomeInput";
import { SportsSelectionModal } from "./SportsSelectionModal";
import { PremiumModal } from "./PremiumModal";

// Demo fallback sports list
const demoSports: SportStatus[] = [
  {
    sport: "NFL",
    key: "americanfootball_nfl",
    isActive: true,
    title: "NFL",
    description: "National Football League",
    group: "Professional",
    hasOutrights: false,
  },
  {
    sport: "NBA",
    key: "basketball_nba",
    isActive: true,
    title: "NBA",
    description: "National Basketball Association",
    group: "Professional",
    hasOutrights: false,
  },
  {
    sport: "College Football",
    key: "americanfootball_ncaaf",
    isActive: true,
    title: "NCAAF",
    description: "College Football",
    group: "College",
    hasOutrights: false,
  },
  {
    sport: "Premier League",
    key: "soccer_epl",
    isActive: true,
    title: "EPL",
    description: "English Premier League",
    group: "Soccer",
    hasOutrights: false,
  },
  {
    sport: "Tennis",
    key: "tennis",
    isActive: true,
    title: "ATP/WTA",
    description: "Professional Tennis",
    group: "Individual",
    hasOutrights: false,
  },
];

const eventTypeMap: { [k in EventType]: string } = {
  match: "🏀 Head-to-Head",
  race: "🏇 Race",
  tournament: "🏆 Tournament",
};

const defaultOutcomes: BettingOutcome[] = [
  { id: uuidv4(), name: "Team A", odds: "" },
  { id: uuidv4(), name: "Team B", odds: "" },
];

export const MainContent: React.FC = () => {
  // Core state
  const [outcomes, setOutcomes] = useState<BettingOutcome[]>([...defaultOutcomes]);
  const [bankroll, setBankroll] = useState<string>("");
  const [kellyFraction, setKellyFraction] = useState<number>(0.25);
  const [eventType, setEventType] = useState<EventType>("match");
  const [result, setResult] = useState<ArbitrageResult | null>(null);
  const [aiRecommendation, setAIRecommendation] = useState<string>("");

  // UI state
  const [isCalculating, setIsCalculating] = useState(false);
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("");
  const [showingSportsSelector, setShowingSportsSelector] = useState(false);
  const [showingPremium, setShowingPremium] = useState(false);

  // Sports API data
  const [sports, setSports] = useState<SportStatus[]>([]);
  const [sportsLoaded, setSportsLoaded] = useState(false);

  // Load sports list on mount
  useEffect(() => {
    fetchAvailableSports().then((sports) => {
      setSports(sports.length ? sports : demoSports);
      setSportsLoaded(true);
    });
  }, []);

  // Update decimalOdds whenever odds change
  useEffect(() => {
    setOutcomes((prev) =>
      prev.map((o) => ({
        ...o,
        decimalOdds: OddsConverter.americanToDecimal(o.odds),
      }))
    );
  }, [outcomes.map((o) => o.odds).join(",")]);

  // Handlers
  const updateOutcome = (idx: number, name: string, odds: string) => {
    setOutcomes((prev) =>
      prev.map((o, i) =>
        i === idx
          ? {
              ...o,
              name,
              odds,
              decimalOdds: OddsConverter.americanToDecimal(odds),
            }
          : o
      )
    );
  };

  const addOutcome = () => {
    setOutcomes((prev) => [
      ...prev,
      { id: uuidv4(), name: `Outcome ${prev.length + 1}`, odds: "" },
    ]);
  };

  const removeOutcome = (idx: number) => {
    setOutcomes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCalculate = () => {
    const numBankroll = parseFloat(bankroll);
    if (isNaN(numBankroll) || numBankroll <= 0) return;
    setIsCalculating(true);
    setTimeout(() => {
      const res = ArbitrageCalculator.calculate(outcomes, numBankroll, kellyFraction);
      setResult(res);
      setAIRecommendation(res ? generateRecommendation(res) : "");
      setIsCalculating(false);
    }, 350);
  };

  // AI Natural Language Event Search
  const handleAIQuery = () => {
    const query = naturalLanguageQuery.toLowerCase();
    if (query.includes("lakers") && (query.includes("warriors"))) {
      setOutcomes([
        { id: uuidv4(), name: "Los Angeles Lakers", odds: "+120", bookmaker: "DraftKings" },
        { id: uuidv4(), name: "Golden State Warriors", odds: "-140", bookmaker: "FanDuel" },
      ]);
      setEventType("match");
      setAIRecommendation("Found Lakers vs Warriors matchup with sample odds.");
    } else if (query.includes("chiefs") && query.includes("bills")) {
      setOutcomes([
        { id: uuidv4(), name: "Kansas City Chiefs", odds: "-110", bookmaker: "BetMGM" },
        { id: uuidv4(), name: "Buffalo Bills", odds: "-110", bookmaker: "Caesars" },
      ]);
      setEventType("match");
      setAIRecommendation("Found Chiefs vs Bills NFL matchup.");
    } else if (query.includes("derby") || query.includes("horse") || query.includes("racing")) {
      setOutcomes([
        { id: uuidv4(), name: "Thunderbolt", odds: "+250", bookmaker: "TVG" },
        { id: uuidv4(), name: "Lightning Strike", odds: "+180", bookmaker: "TwinSpires" },
        { id: uuidv4(), name: "Storm Chaser", odds: "+300", bookmaker: "BetRivers" },
        { id: uuidv4(), name: "Wind Walker", odds: "+400", bookmaker: "PointsBet" },
      ]);
      setEventType("race");
      setAIRecommendation("Found horse racing event with 4 contenders.");
    } else if (query.includes("tournament") || query.includes("march madness") || query.includes("bracket")) {
      setOutcomes([
        { id: uuidv4(), name: "Duke", odds: "+300", bookmaker: "DraftKings" },
        { id: uuidv4(), name: "North Carolina", odds: "+450", bookmaker: "FanDuel" },
        { id: uuidv4(), name: "Gonzaga", odds: "+500", bookmaker: "BetMGM" },
        { id: uuidv4(), name: "Kansas", odds: "+600", bookmaker: "Caesars" },
      ]);
      setEventType("tournament");
      setAIRecommendation("Found tournament odds for top contenders.");
    } else if ((query.includes("soccer") || query.includes("football")) && !query.includes("american")) {
      setOutcomes([
        { id: uuidv4(), name: "Manchester City", odds: "+150", bookmaker: "DraftKings" },
        { id: uuidv4(), name: "Draw", odds: "+220", bookmaker: "FanDuel" },
        { id: uuidv4(), name: "Arsenal", odds: "+200", bookmaker: "BetMGM" },
      ]);
      setEventType("match");
      setAIRecommendation("Found Premier League matchup with 3-way betting.");
    } else {
      setAIRecommendation(
        "Try specific queries like 'Lakers vs Warriors', 'Kentucky Derby', 'Chiefs vs Bills', or 'March Madness tournament'."
      );
    }
  };

  // Live Odds import
  const handleLiveOddsImport = async (sport: SportStatus) => {
    if (!sportsLoaded || !sports.length) {
      setOutcomes(createSampleOutcomes(sport.key));
      return;
    }
    setIsCalculating(true);
    const oddsData = await fetchOdds(sport.key);
    if (
      oddsData.length &&
      oddsData[0].bookmakers?.length &&
      oddsData[0].bookmakers[0].markets?.length
    ) {
      const market = oddsData[0].bookmakers[0].markets[0];
      setOutcomes(
        market.outcomes.map((outcome) => ({
          id: uuidv4(),
          name: outcome.name,
          odds: OddsConverter.decimalToAmerican(outcome.price),
          decimalOdds: outcome.price,
          bookmaker: oddsData[0].bookmakers[0].title,
        }))
      );
      setEventType("match");
      setAIRecommendation("Imported live odds from sportsbook API.");
    } else {
      setOutcomes(createSampleOutcomes(sport.key));
      setAIRecommendation("Loaded demo odds (API unavailable).");
    }
    setIsCalculating(false);
  };

  // Arbitrage scan (random event demo)
  const handleScan = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const scanResults: [string, BettingOutcome[]][] = [
        [
          "NBA: Lakers vs Warriors",
          [
            { id: uuidv4(), name: "Lakers", odds: "+120", bookmaker: "DraftKings" },
            { id: uuidv4(), name: "Warriors", odds: "-105", bookmaker: "FanDuel" },
          ],
        ],
        [
          "NFL: Chiefs vs Bills",
          [
            { id: uuidv4(), name: "Chiefs", odds: "-110", bookmaker: "BetMGM" },
            { id: uuidv4(), name: "Bills", odds: "+105", bookmaker: "Caesars" },
          ],
        ],
        [
          "Premier League: Man City vs Arsenal",
          [
            { id: uuidv4(), name: "Man City", odds: "+180", bookmaker: "DraftKings" },
            { id: uuidv4(), name: "Draw", odds: "+240", bookmaker: "FanDuel" },
            { id: uuidv4(), name: "Arsenal", odds: "+160", bookmaker: "BetMGM" },
          ],
        ],
      ];
      const random = scanResults[Math.floor(Math.random() * scanResults.length)];
      setOutcomes(random[1]);
      setAIRecommendation(`Scan complete: ${random[0]}`);
      setIsCalculating(false);
    }, 1600);
  };

  // Demo data quick fill
  const handleLoadDemo = () => {
    setOutcomes([
      { id: uuidv4(), name: "Team A", odds: "+150", bookmaker: "DraftKings" },
      { id: uuidv4(), name: "Team B", odds: "-180", bookmaker: "FanDuel" },
    ]);
    setBankroll("1000");
    setEventType("match");
    setAIRecommendation("Loaded demo data.");
  };

  // Kelly risk label
  const kellyRiskLevel = () => {
    if (kellyFraction <= 0.15) return "Very Safe";
    if (kellyFraction <= 0.25) return "Conservative";
    if (kellyFraction <= 0.35) return "Moderate";
    if (kellyFraction <= 0.45) return "Aggressive";
    return "Very Aggressive";
  };
  const kellyRiskColor = () => {
    if (kellyFraction <= 0.25) return "#2ecc40";
    if (kellyFraction <= 0.35) return "#ffb84d";
    return "#ff6b6b";
  };

  // Recommendation summary
  const generateRecommendation = (result: ArbitrageResult) => {
    if (result.hasArbitrage) {
      return `✅ Excellent! This is a guaranteed profit opportunity with a ${result.margin.toFixed(
        2
      )}% margin. You'll profit $${result.guaranteedReturn.toFixed(
        2
      )} regardless of the outcome. Place the calculated stakes across all bookmakers.`;
    } else {
      const totalImpliedProb = outcomes
        .map((o) => o.decimalOdds)
        .filter((d): d is number => typeof d === "number" && !isNaN(d))
        .reduce((sum: number, d: number) => sum + 1 / d, 0);
      return `⚠️ No arbitrage detected. Total implied probability is ${(
        totalImpliedProb * 100
      ).toFixed(
        2
      )}%. You need odds that sum to less than 100% implied probability. Try different bookmakers or wait for odds movement.`;
    }
  };

  // Fallback sample odds for sports
  function createSampleOutcomes(sportKey: string): BettingOutcome[] {
    switch (sportKey) {
      case "americanfootball_nfl":
        return [
          { id: uuidv4(), name: "Kansas City Chiefs", odds: "-110", bookmaker: "DraftKings" },
          { id: uuidv4(), name: "Buffalo Bills", odds: "-110", bookmaker: "FanDuel" },
        ];
      case "basketball_nba":
        return [
          { id: uuidv4(), name: "Los Angeles Lakers", odds: "+120", bookmaker: "BetMGM" },
          { id: uuidv4(), name: "Golden State Warriors", odds: "-140", bookmaker: "Caesars" },
        ];
      case "soccer_epl":
        return [
          { id: uuidv4(), name: "Manchester City", odds: "+150", bookmaker: "DraftKings" },
          { id: uuidv4(), name: "Draw", odds: "+220", bookmaker: "FanDuel" },
          { id: uuidv4(), name: "Arsenal", odds: "+200", bookmaker: "BetMGM" },
        ];
      case "tennis":
        return [
          { id: uuidv4(), name: "Novak Djokovic", odds: "-200", bookmaker: "FanDuel" },
          { id: uuidv4(), name: "Carlos Alcaraz", odds: "+170", bookmaker: "DraftKings" },
        ];
      default:
        return [
          { id: uuidv4(), name: "Team A", odds: "+110", bookmaker: "Book A" },
          { id: uuidv4(), name: "Team B", odds: "-130", bookmaker: "Book B" },
        ];
    }
  }

  return (
    <div className="container">
      <h1>ArBETrage</h1>
      <p style={{ textAlign: "center", marginTop: 0, color: "#555" }}>
        Advanced Multi-Outcome Arbitrage Calculator
      </p>
      <Card title="Manual Entry">
        {/* Natural Language Event Search */}
        <div>
          <label>
            <b>🔍 AI Event Search</b>
            <input
              value={naturalLanguageQuery}
              onChange={(e) => setNaturalLanguageQuery(e.target.value)}
              placeholder="e.g. 'Lakers vs Warriors', 'March Madness'"
              style={{ width: "100%", marginTop: 4 }}
              disabled={isCalculating}
            />
          </label>
          <button
            onClick={handleAIQuery}
            disabled={!naturalLanguageQuery || isCalculating}
            style={{ marginTop: 8, background: "#667eea" }}
          >
            Search
          </button>
          {aiRecommendation && (
            <div
              style={{
                background: "#f0f8ff",
                borderRadius: 8,
                padding: 8,
                marginTop: 8,
                fontSize: 13,
              }}
            >
              {aiRecommendation}
            </div>
          )}
        </div>
        <hr />
        {/* Event Type Picker */}
        <div>
          <label>
            <b>🎯 Event Type:</b>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              style={{ marginLeft: 8 }}
            >
              <option value="match">🏀 Head-to-Head</option>
              <option value="race">🏇 Race</option>
              <option value="tournament">🏆 Tournament</option>
            </select>
          </label>
          <span style={{ marginLeft: 12, color: "#888", fontSize: 13 }}>
            {eventType === "match"
              ? "Two-way or three-way betting (win/loss or win/draw/loss)"
              : eventType === "race"
              ? "Multiple participants competing"
              : "Tournament winner or bracket-style"}
          </span>
        </div>
        <hr />
        {/* Bankroll + Kelly */}
        <div>
          <label>
            <b>💰 Bankroll:</b>
            <input
              type="number"
              value={bankroll}
              onChange={(e) => setBankroll(e.target.value)}
              placeholder="Enter bankroll amount"
              style={{ marginLeft: 8, width: 120 }}
            />
          </label>
          <div style={{ marginTop: 10 }}>
            <b>Kelly Fraction: {Math.round(kellyFraction * 100)}%</b>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={kellyFraction}
              onChange={(e) => setKellyFraction(parseFloat(e.target.value))}
              style={{ marginLeft: 16, width: 180, verticalAlign: "middle" }}
            />
            <span
              style={{
                marginLeft: 10,
                color: "#fff",
                padding: "2px 8px",
                background: kellyRiskColor(),
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {kellyRiskLevel()}
            </span>
          </div>
        </div>
        <hr />
        {/* Outcomes */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <b>🎯 Betting Outcomes</b>
            <button onClick={addOutcome} style={{ background: "#29b6f6" }}>
              + Add
            </button>
          </div>
          {outcomes.map((o, idx) => (
            <OutcomeInput
              key={o.id}
              outcome={o}
              onUpdate={(name, odds) => updateOutcome(idx, name, odds)}
              onRemove={() => removeOutcome(idx)}
              canRemove={outcomes.length > 2}
            />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            onClick={handleCalculate}
            disabled={isCalculating || !bankroll}
            style={{
              background: "linear-gradient(90deg,#667eea,#764ba2)",
              width: 200,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {isCalculating ? "Calculating..." : "Calculate Arbitrage"}
          </button>
        </div>
      </Card>
      {/* Quick Actions */}
      <Card title="Live Odds & Tools">
        <button onClick={() => setShowingSportsSelector(true)} style={{ background: "#29b6f6" }}>
          🟢 Live Odds Import
        </button>
        <button onClick={handleScan} disabled={isCalculating} style={{ background: "#2ecc40" }}>
          🔍 Auto-Scan Markets
        </button>
        <button onClick={handleLoadDemo} style={{ background: "#9c27b0" }}>
          ⚡ Load Demo
        </button>
        <button onClick={() => setShowingPremium(true)} style={{ background: "#ffb84d" }}>
          👑 Premium Features
        </button>
      </Card>
      {/* Results */}
      {result && (
        <Card title="Arbitrage Analysis">
          <div style={{ marginBottom: 8 }}>
            <span
              style={{
                padding: "2px 12px",
                background: "#e3e3ff",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {eventTypeMap[eventType]}
            </span>
          </div>
          <div>
            <b>
              {result.hasArbitrage ? "✅ ARBITRAGE FOUND" : "⚠️ NO ARBITRAGE"}
            </b>{" "}
            <span style={{ float: "right", fontWeight: 700, color: result.guaranteedReturn >= 0 ? "#2ecc40" : "#ff6b6b" }}>
              ${result.guaranteedReturn.toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#888" }}>
            Return Rate: {result.returnRate.toFixed(2)}% • Margin: {result.margin.toFixed(2)}% • Kelly: {Math.round(result.kellyFraction * 100)}%
          </div>
          {aiRecommendation && (
            <div
              style={{
                margin: "10px 0",
                padding: "10px 12px",
                background: "#f0f8ff",
                borderRadius: 8,
              }}
            >
              <b>📊 Analysis</b>
              <div>{aiRecommendation}</div>
            </div>
          )}
          <div style={{ marginTop: 14 }}>
            <b>Recommended Stakes</b>
            <ul>
              {outcomes.map((o) =>
                result.stakes[o.id] ? (
                  <li key={o.id}>
                    <b>{o.name}</b> (<span style={{ color: "#555" }}>{o.odds}</span>
                    {o.bookmaker && <span> • {o.bookmaker}</span>}) —{" "}
                    <span style={{ fontWeight: 600 }}>
                      ${result.stakes[o.id].toFixed(2)}
                    </span>
                  </li>
                ) : null
              )}
            </ul>
            <b>Total Investment:</b> ${result.totalStake.toFixed(2)}
          </div>
          <div style={{ marginTop: 16 }}>
            <b>Profit Scenarios</b>
            <ul>
              {outcomes.map((o) =>
                result.returns[o.id] !== undefined ? (
                  <li key={o.id}>
                    If <b>{o.name}</b> wins:{" "}
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          result.returns[o.id]! >= 0 ? "#2ecc40" : "#ff6b6b",
                      }}
                    >
                      ${result.returns[o.id]!.toFixed(2)}
                    </span>
                  </li>
                ) : null
              )}
            </ul>
          </div>
        </Card>
      )}
      <SportsSelectionModal
        open={showingSportsSelector}
        sports={sports}
        onSelect={handleLiveOddsImport}
        onClose={() => setShowingSportsSelector(false)}
      />
      <PremiumModal open={showingPremium} onClose={() => setShowingPremium(false)} />
    </div>
  );
};