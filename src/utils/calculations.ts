/**
 * Calculates the Internal Rate of Return (IRR) using Newton-Raphson method.
 * For a lease, cashflows are: [-DownPayment, -Monthly, -Monthly, ..., -(Monthly + Residual)]
 */
export function calculateIRR(cashflows: number[]): number | null {
  if (!cashflows || cashflows.length < 2) return null;

  let rate = 0.05; // Initial guess

  for (let i = 0; i < 100; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let t = 0; t < cashflows.length; t++) {
      const cf = cashflows[t];
      const factor = Math.pow(1 + rate, t);
      npv += cf / factor;
      if (t > 0) {
        dnpv += (-t * cf) / Math.pow(1 + rate, t + 1);
      }
    }

    if (!isFinite(npv) || !isFinite(dnpv) || Math.abs(dnpv) < 1e-10) return null;

    const newRate = rate - npv / dnpv;
    if (!isFinite(newRate)) return null;
    if (Math.abs(newRate - rate) < 1e-8) break;

    // Sanity check: rate shouldn't be too extreme
    if (Math.abs(newRate) > 10) return null;

    rate = newRate;
  }

  return isFinite(rate) ? rate : null;
}

/**
 * Standard monthly payment formula for a lease.
 */
export function calculateMonthlyPayment({
  price,
  downPayment,
  residualValue,
  termMonths,
  monthlyRate,
}: {
  price: number;
  downPayment: number;
  residualValue: number;
  termMonths: number;
  monthlyRate: number;
}): number {
  const financed = price - downPayment;
  const discountFactor = Math.pow(1 + monthlyRate, -termMonths);

  // If monthlyRate is 0, it's a simple division
  if (monthlyRate === 0) {
    return (financed - residualValue) / termMonths;
  }

  return (
    ((financed - residualValue * discountFactor) * monthlyRate) /
    (1 - discountFactor)
  );
}
