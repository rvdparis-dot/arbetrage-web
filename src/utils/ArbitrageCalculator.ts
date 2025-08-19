import { BettingOutcome, ArbitrageResult } from "../models/types";

export class ArbitrageCalculator {
  static calculate(
    outcomes: BettingOutcome[],
    bankroll: number,
    kellyFraction: number = 0.25
  ): ArbitrageResult | null {
    const validOutcomes = outcomes.filter(
      (o) => o.decimalOdds !== undefined && o.decimalOdds > 0
    );
    if (validOutcomes.length < 2) return null;

    const totalImpliedProb = validOutcomes.reduce(
      (sum, o) => sum + 1 / (o.decimalOdds || 1),
      0
    );
    const hasArbitrage = totalImpliedProb < 1;
    const margin = (1 - totalImpliedProb) * 100;

    const effectiveBankroll = bankroll * kellyFraction;
    const totalStake = hasArbitrage ? effectiveBankroll : effectiveBankroll * 0.5;

    const stakes: Record<string, number> = {};
    const returns: Record<string, number> = {};
    let guaranteedReturn = Number.POSITIVE_INFINITY;

    validOutcomes.forEach((o) => {
      const impliedProb = 1 / (o.decimalOdds || 1);
      stakes[o.id] = (totalStake * impliedProb) / totalImpliedProb;
      const winAmount = stakes[o.id] * (o.decimalOdds || 1);
      const netReturn = winAmount - totalStake;
      returns[o.id] = netReturn;
      guaranteedReturn = Math.min(guaranteedReturn, netReturn);
    });

    const returnRate = (guaranteedReturn / totalStake) * 100;

    return {
      hasArbitrage,
      margin,
      totalStake,
      guaranteedReturn,
      returnRate,
      stakes,
      returns,
      kellyFraction,
    };
  }
}