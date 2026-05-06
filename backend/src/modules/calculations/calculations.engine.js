/**
 * EduCost AI — Core Financial Calculation Engine
 * All monetary values should be in the same currency as inputs.
 */

/**
 * COST CALCULATION
 * Accounts for inflation compounded per year.
 */
const calculateCost = ({
  tuitionPerYear,
  duration,
  rent,
  food,
  transport,
  insurance,
  equipment,
  misc,
  inflation = 0.04,
}) => {
  let totalTuition = 0;
  let totalLiving = 0;
  const yearlyBreakdown = [];

  for (let year = 1; year <= duration; year++) {
    const inflationFactor = Math.pow(1 + inflation, year - 1);
    const yearTuition = tuitionPerYear * inflationFactor;
    const yearLiving = (rent * 12 + food * 12 + transport * 12 + insurance * 12) * inflationFactor;
    const yearEquip = year === 1 ? equipment : 0; // one-time
    const yearMisc = misc * 12 * inflationFactor;

    totalTuition += yearTuition;
    totalLiving += yearLiving + yearEquip + yearMisc;

    yearlyBreakdown.push({
      year,
      tuition: round(yearTuition),
      living: round(yearLiving),
      equipment: round(yearEquip),
      misc: round(yearMisc),
      subtotal: round(yearTuition + yearLiving + yearEquip + yearMisc),
    });
  }

  const hiddenCost = totalLiving * 0.08; // 8% buffer for hidden costs
  const grandTotal = totalTuition + totalLiving + hiddenCost;

  return {
    totalTuition: round(totalTuition),
    livingCost: round(totalLiving),
    hiddenCost: round(hiddenCost),
    grandTotal: round(grandTotal),
    yearlyBreakdown,
  };
};

/**
 * LOAN / EMI CALCULATION
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * Generates full amortization schedule.
 */
const calculateLoan = ({
  principal,
  annualInterestRate,
  tenureYears,
  moratoriumMonths = 0, // grace period during study
}) => {
  const r = annualInterestRate / 12 / 100; // monthly rate
  const n = tenureYears * 12; // total months of repayment

  // Interest accrued during moratorium (capitalized)
  const principalWithMoratorium = moratoriumMonths > 0
    ? principal * Math.pow(1 + r, moratoriumMonths)
    : principal;

  let emi;
  if (r === 0) {
    emi = principalWithMoratorium / n;
  } else {
    emi = (principalWithMoratorium * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const totalPayment = emi * n;
  const totalInterest = totalPayment - principalWithMoratorium;

  // Amortization schedule
  const amortizationSchedule = [];
  let balance = principalWithMoratorium;

  for (let month = 1; month <= n; month++) {
    const interestPaid = balance * r;
    const principalPaid = emi - interestPaid;
    balance -= principalPaid;

    if (month % 12 === 0 || month === n) {
      amortizationSchedule.push({
        period: `Year ${Math.ceil(month / 12)}`,
        month,
        emi: round(emi),
        principalPaid: round(principalPaid),
        interestPaid: round(interestPaid),
        balance: round(Math.max(balance, 0)),
      });
    }
  }

  return {
    emi: round(emi),
    totalPayment: round(totalPayment),
    totalInterest: round(totalInterest),
    principalWithMoratorium: round(principalWithMoratorium),
    effectiveInterestRate: round((totalInterest / principal) * 100),
    amortizationSchedule,
  };
};

/**
 * ROI ANALYSIS
 */
const calculateROI = ({
  expectedSalary,
  salaryGrowthRate = 0.05,
  placementProbability = 0.85, // 0–1
  loanAmount,
  annualInterestRate,
  tenureYears,
  totalCost,
  moratoriumMonths = 0,
}) => {
  const loan = calculateLoan({ principal: loanAmount, annualInterestRate, tenureYears, moratoriumMonths });

  // Risk-adjusted expected salary
  const riskAdjustedSalary = expectedSalary * placementProbability;

  // Debt-to-income ratio (annual EMI / annual salary)
  const annualEmi = loan.emi * 12;
  const debtIncomeRatio = round((annualEmi / riskAdjustedSalary) * 100);

  // Repayment years (how many years to repay via savings)
  // Assume 30% of salary goes toward loan
  const monthlyDisposable = riskAdjustedSalary / 12 * 0.30;
  let cumulative = 0;
  let repaymentMonths = 0;
  let loanBalance = loan.principalWithMoratorium;
  const r = annualInterestRate / 12 / 100;

  while (loanBalance > 0 && repaymentMonths < 600) {
    const interest = loanBalance * r;
    const payment = Math.min(monthlyDisposable, loanBalance + interest);
    loanBalance -= (payment - interest);
    repaymentMonths++;
  }
  const repaymentYears = round(repaymentMonths / 12, 1);

  // Break-even: when cumulative salary > total cost
  let cumulativeSalary = 0;
  let breakEvenYear = 0;
  for (let y = 1; y <= 30; y++) {
    cumulativeSalary += riskAdjustedSalary * Math.pow(1 + salaryGrowthRate, y - 1);
    if (cumulativeSalary >= totalCost + loan.totalInterest) {
      breakEvenYear = y;
      break;
    }
  }

  // Stress score (0–100, higher = worse)
  const stressScore = computeStressScore({
    debtIncomeRatio,
    placementProbability,
    repaymentYears,
    totalCost,
    expectedSalary,
  });

  const riskLevel = stressScore < 30 ? 'LOW' : stressScore < 55 ? 'MEDIUM' : stressScore < 75 ? 'HIGH' : 'CRITICAL';

  return {
    debtIncomeRatio,
    repaymentYears,
    breakEvenYear: breakEvenYear || '>30',
    stressScore,
    riskLevel,
    annualEmi: round(annualEmi),
    riskAdjustedSalary: round(riskAdjustedSalary),
    loanSummary: loan,
  };
};

/**
 * STRESS SCORE ENGINE (0–100)
 * Weighted composite of financial risk indicators.
 */
const computeStressScore = ({ debtIncomeRatio, placementProbability, repaymentYears, totalCost, expectedSalary }) => {
  let score = 0;

  // Debt-to-income (weight: 35)
  if (debtIncomeRatio < 15) score += 0;
  else if (debtIncomeRatio < 25) score += 10;
  else if (debtIncomeRatio < 40) score += 20;
  else if (debtIncomeRatio < 60) score += 30;
  else score += 35;

  // Placement risk (weight: 25)
  const placementRisk = (1 - placementProbability) * 100;
  score += placementRisk * 0.25;

  // Repayment duration (weight: 20)
  if (repaymentYears < 3) score += 0;
  else if (repaymentYears < 5) score += 8;
  else if (repaymentYears < 8) score += 14;
  else score += 20;

  // Cost-to-income (weight: 20)
  const costIncomeRatio = totalCost / expectedSalary;
  if (costIncomeRatio < 1) score += 0;
  else if (costIncomeRatio < 2) score += 8;
  else if (costIncomeRatio < 4) score += 14;
  else score += 20;

  return Math.min(100, round(score));
};

const round = (val, decimals = 2) => Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);

module.exports = { calculateCost, calculateLoan, calculateROI, computeStressScore, round };
