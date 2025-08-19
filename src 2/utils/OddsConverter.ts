export class OddsConverter {
  static americanToDecimal(americanOdds: string): number | undefined {
    const cleanedOdds = americanOdds.trim().replace("+", "");
    const numOdds = parseInt(cleanedOdds, 10);
    if (isNaN(numOdds) || numOdds === 0) return undefined;
    if (numOdds > 0) {
      return numOdds / 100 + 1;
    } else {
      return 100 / Math.abs(numOdds) + 1;
    }
  }

  static decimalToAmerican(decimalOdds: number): string {
    if (decimalOdds >= 2.0) {
      const american = (decimalOdds - 1.0) * 100;
      return `+${Math.round(american)}`;
    } else {
      const american = -100 / (decimalOdds - 1.0);
      return `${Math.round(american)}`;
    }
  }

  static impliedProbability(decimalOdds: number): number {
    return 1 / decimalOdds;
  }
}