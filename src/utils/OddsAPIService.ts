import { SportsAPIResponse, SportStatus, OddsAPIResponse } from "../models/types";

const API_KEY = "3ce28f9c3654f2ccb2804e0a10c63879";
const BASE_URL = "https://api.the-odds-api.com/v4";

export async function fetchAvailableSports(): Promise<SportStatus[]> {
  try {
    const res = await fetch(`${BASE_URL}/sports/?apiKey=${API_KEY}`);
    if (!res.ok) throw new Error("API error: " + res.status);
    const sports: SportsAPIResponse[] = await res.json();
    return sports.map((sport) => ({
      sport: sport.title,
      key: sport.key,
      isActive: sport.active,
      title: sport.title,
      description: sport.description,
      group: sport.group,
      hasOutrights: sport.has_outrights,
    }));
  } catch (err) {
    // Fallback to empty
    return [];
  }
}

export async function fetchOdds(sportKey: string, market: string = "h2h"): Promise<OddsAPIResponse[]> {
  try {
    const url = `${BASE_URL}/sports/${sportKey}/odds/?apiKey=${API_KEY}&regions=us&markets=${market}&oddsFormat=american`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error: " + res.status);
    return await res.json();
  } catch (err) {
    return [];
  }
}