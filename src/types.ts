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
}

export interface LeaseResult extends LeaseInput {
  effectiveMonthlyPayment: number;
  effectiveInterestRate: number;
  totalPaid: number;
  totalWithBuyout: number;
  residualPercent: number;
  isBestMonthly: boolean;
  isBestInterest: boolean;
  isBestTotalPaid: boolean;
  isBestTotalWithBuyout: boolean;
  isBestResidual: boolean;
}
