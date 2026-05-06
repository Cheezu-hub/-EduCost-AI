// ─── Cost Calculation ────────────────────────────────────────────────────────
export interface CostInput {
  tuitionPerYear: number;     // annual tuition
  durationYears: number;      // program duration
  rent: number;               // monthly rent
  food: number;               // monthly food
  transport: number;          // monthly transport
  insurance: number;          // monthly insurance
  equipment: number;          // one-time equipment cost
  misc: number;               // monthly miscellaneous
  inflationRate?: number;     // annual inflation rate (default 3%)
}

export interface CostOutput {
  totalTuition: number;
  livingCostTotal: number;
  hiddenCost: number;
  grandTotal: number;
  yearlyBreakdown: YearlyBreakdown[];
}

interface YearlyBreakdown {
  year: number;
  tuition: number;
  living: number;
  total: number;
}

export function calculateCost(input: CostInput): CostOutput {
  const inflation = input.inflationRate ?? 0.03;
  const monthlyLiving = input.rent + input.food + input.transport + input.insurance + input.misc;
  const yearlyLiving = monthlyLiving * 12;

  let totalTuition = 0;
  let livingCostTotal = 0;
  const yearlyBreakdown: YearlyBreakdown[] = [];

  for (let year = 1; year <= input.durationYears; year++) {
    const inflationFactor = Math.pow(1 + inflation, year - 1);
    const tuitionYear = input.tuitionPerYear * inflationFactor;
    const livingYear = yearlyLiving * inflationFactor;

    totalTuition += tuitionYear;
    livingCostTotal += livingYear;

    yearlyBreakdown.push({
      year,
      tuition: round(tuitionYear),
      living: round(livingYear),
      total: round(tuitionYear + livingYear),
    });
  }

  const hiddenCost = input.equipment + monthlyLiving * 2; // setup + buffer
  const grandTotal = totalTuition + livingCostTotal + hiddenCost;

  return {
    totalTuition: round(totalTuition),
    livingCostTotal: round(livingCostTotal),
    hiddenCost: round(hiddenCost),
    grandTotal: round(grandTotal),
    yearlyBreakdown,
  };
}

// ─── Loan / EMI Calculation ──────────────────────────────────────────────────
export interface LoanInput {
  principal: number;          // loan amount
  annualInterestRate: number; // e.g. 0.07 for 7%
  tenureYears: number;        // repayment period
  moratoriumMonths?: number;  // grace period (default 0)
}

export interface AmortizationEntry {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanOutput {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  effectivePrincipal: number;
  amortizationSchedule: AmortizationEntry[];
}

export function calculateLoan(input: LoanInput): LoanOutput {
  const moratorium = input.moratoriumMonths ?? 0;
  const monthlyRate = input.annualInterestRate / 12;

  // During moratorium, interest accrues on principal
  const accruedInterest = input.principal * monthlyRate * moratorium;
  const effectivePrincipal = input.principal + accruedInterest;

  const n = input.tenureYears * 12;

  // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  let emi: number;
  if (monthlyRate === 0) {
    emi = effectivePrincipal / n;
  } else {
    const factor = Math.pow(1 + monthlyRate, n);
    emi = (effectivePrincipal * monthlyRate * factor) / (factor - 1);
  }

  // Build amortization schedule
  let balance = effectivePrincipal;
  const amortizationSchedule: AmortizationEntry[] = [];
  let totalPayment = 0;

  for (let month = 1; month <= n; month++) {
    const interestPortion = balance * monthlyRate;
    const principalPortion = emi - interestPortion;
    balance = Math.max(0, balance - principalPortion);
    totalPayment += emi;

    amortizationSchedule.push({
      month,
      emi: round(emi),
      principal: round(principalPortion),
      interest: round(interestPortion),
      balance: round(balance),
    });
  }

  return {
    emi: round(emi),
    totalPayment: round(totalPayment),
    totalInterest: round(totalPayment - effectivePrincipal),
    effectivePrincipal: round(effectivePrincipal),
    amortizationSchedule,
  };
}

// ─── ROI Analysis ────────────────────────────────────────────────────────────
export interface ROIInput {
  expectedSalary: number;         // starting annual salary post-graduation
  salaryGrowthRate: number;       // annual salary growth e.g. 0.05
  placementProbability: number;   // 0 to 1
  totalLoan: number;              // total loan amount
  loanEmi: number;                // monthly EMI
  totalCost: number;              // grand total education cost
  savingsBuffer?: number;         // personal savings/buffer
}

export interface ROIOutput {
  debtIncomeRatio: number;
  repaymentYears: number;
  breakEvenYear: number;
  stressScore: number;            // 0–100 (100 = most stressed)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  netPresentValue: number;
  cumulativeEarnings: number[];   // year-by-year (10 years)
  analysis: string;
}

export function calculateROI(input: ROIInput): ROIOutput {
  const monthlyIncome = (input.expectedSalary * input.placementProbability) / 12;
  const debtIncomeRatio = input.totalLoan / input.expectedSalary;
  const emiToIncome = input.loanEmi / monthlyIncome;

  // Repayment years
  const repaymentYears = debtIncomeRatio / (1 - emiToIncome);

  // Break-even: when cumulative salary > total cost
  let breakEvenYear = 0;
  let cumulative = 0;
  const cumulativeEarnings: number[] = [];

  for (let year = 1; year <= 10; year++) {
    const yearlySalary = input.expectedSalary * Math.pow(1 + input.salaryGrowthRate, year - 1);
    const loanRepaid = input.loanEmi * 12;
    cumulative += (yearlySalary - loanRepaid) * input.placementProbability;
    cumulativeEarnings.push(round(cumulative));

    if (cumulative >= input.totalCost && breakEvenYear === 0) {
      breakEvenYear = year;
    }
  }

  if (breakEvenYear === 0) breakEvenYear = 11; // beyond 10 years

  // Stress score (0–100)
  const emiStress = Math.min(emiToIncome * 100, 50);           // up to 50pts
  const dirStress = Math.min((debtIncomeRatio / 5) * 25, 25);  // up to 25pts
  const placementStress = (1 - input.placementProbability) * 25; // up to 25pts
  const stressScore = Math.min(100, Math.round(emiStress + dirStress + placementStress));

  // Risk level
  let riskLevel: ROIOutput['riskLevel'];
  if (stressScore < 25) riskLevel = 'LOW';
  else if (stressScore < 50) riskLevel = 'MEDIUM';
  else if (stressScore < 75) riskLevel = 'HIGH';
  else riskLevel = 'CRITICAL';

  // Simple NPV (discount rate 5%)
  const discountRate = 0.05;
  let npv = -input.totalCost;
  for (let year = 1; year <= 10; year++) {
    const earnings = input.expectedSalary * Math.pow(1 + input.salaryGrowthRate, year - 1) * input.placementProbability;
    npv += earnings / Math.pow(1 + discountRate, year);
  }

  const analysis = generateAnalysis({ stressScore, riskLevel, debtIncomeRatio, emiToIncome, breakEvenYear });

  return {
    debtIncomeRatio: round(debtIncomeRatio),
    repaymentYears: round(Math.max(0, repaymentYears)),
    breakEvenYear,
    stressScore,
    riskLevel,
    netPresentValue: round(npv),
    cumulativeEarnings,
    analysis,
  };
}

function generateAnalysis(data: {
  stressScore: number;
  riskLevel: string;
  debtIncomeRatio: number;
  emiToIncome: number;
  breakEvenYear: number;
}): string {
  const parts: string[] = [];

  if (data.debtIncomeRatio > 3)
    parts.push('Debt-to-income ratio is high (>3x annual salary). Consider reducing loan amount or increasing earning potential.');
  if (data.emiToIncome > 0.4)
    parts.push('EMI exceeds 40% of expected income, which may cause financial strain. Aim for ≤30%.');
  if (data.breakEvenYear > 7)
    parts.push('Break-even beyond 7 years suggests long-term financial pressure. Explore scholarships or part-time income.');
  if (data.stressScore < 30)
    parts.push('Strong financial position. This investment looks sustainable.');

  return parts.join(' ') || 'Financial profile is within acceptable range.';
}

// ─── Simulation ──────────────────────────────────────────────────────────────
export interface SimulationInput extends ROIInput {
  salaryAdjustment?: number;     // % change in salary
  delayYears?: number;           // job search delay
  extraExpenses?: number;        // additional monthly expenses
  interestRateAdjustment?: number; // change in interest rate
}

export function runSimulation(input: SimulationInput, loanInput: LoanInput): {
  cost: Partial<CostOutput>;
  loan: LoanOutput;
  roi: ROIOutput;
} {
  // Apply adjustments
  const adjustedSalary = input.expectedSalary * (1 + (input.salaryAdjustment ?? 0));
  const adjustedRate = loanInput.annualInterestRate + (input.interestRateAdjustment ?? 0);
  const delayPenalty = input.delayYears ?? 0;
  const adjustedPlacement = Math.max(0, input.placementProbability - delayPenalty * 0.05);

  const loan = calculateLoan({ ...loanInput, annualInterestRate: adjustedRate });
  const roi = calculateROI({
    ...input,
    expectedSalary: adjustedSalary,
    placementProbability: adjustedPlacement,
    loanEmi: loan.emi,
    totalLoan: loan.effectivePrincipal,
  });

  return { cost: {}, loan, roi };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function round(n: number, decimals = 2): number {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
