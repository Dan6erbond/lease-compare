export interface LeaseInput {
  id: string;
  name: string;
  price: number;
  downPayment: number;
  monthlyPayment: number | null;
  termMonths: number;
  residualValue: number;
  interestRate: number | null;
  listingUrl?: string;
  imageUrl?: string;
  annualDistance: number;
  additionalDistanceCost: number | null;
}

export interface LeaseResult extends LeaseInput {
  effectiveMonthlyPayment: number;
  effectiveInterestRate: number;
  totalPaid: number;
  totalWithBuyout: number;
  residualPercent: number; // The % of Price that is Residual
  monthlyDepreciation: number; // (Price - Residual) / Term
  depreciationPercentOfPayment: number; // % of monthly payment going to value loss
  costPerDistance: number; // Total Paid / (Annual Distance * Years)
  downPaymentPercent: number; // (Down Payment / Price) * 100
  monthlyAsPercentOfPrice: number; // (Monthly / Price) * 100
  isExcessiveDistanceCost: boolean;

  // Comparison Flags (Best in Class)
  isBestMonthly: boolean;
  isBestInterest: boolean;
  isBestTotalPaid: boolean;
  isBestTotalWithBuyout: boolean;
  isBestResidual: boolean;
  isBestValuePerDistance?: boolean; // Lowest cost per km/mile
}

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  locale: string;
  flag: string;
  distanceUnit: string;
}
