export interface BettingOutcome {
  id: string;
  name: string;
  odds: string;
  decimalOdds?: number;
  bookmaker?: string;
}

export interface ArbitrageResult {
  hasArbitrage: boolean;
  margin: number;
  totalStake: number;
  guaranteedReturn: number;
  returnRate: number;
  stakes: Record<string, number>;
  returns: Record<string, number>;
  kellyFraction: number;
}

export interface SportStatus {
  sport: string;
  key: string;
  isActive: boolean;
  title: string;
  description: string;
  group: string;
  hasOutrights: boolean;
}

export type EventType = "match" | "race" | "tournament";

export interface OddsAPIResponse {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team?: string;
  away_team?: string;
  bookmakers: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface Market {
  key: string;
  last_update: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
  point?: number;
}

export interface SportsAPIResponse {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}