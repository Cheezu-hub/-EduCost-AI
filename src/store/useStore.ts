import { create } from 'zustand';

export type UserData = {
  course: string;
  tuition: number;
  livingStyle: 'low' | 'medium' | 'high';
  savings: number;
  expectedSalary: number;
};

export type SimulationParams = {
  salaryChangePercent: number;
  interestRate: number;
  placementDelayMonths: number;
};

interface AppState {
  userData: UserData;
  setUserData: (data: Partial<UserData>) => void;
  simulationParams: SimulationParams;
  setSimulationParams: (params: Partial<SimulationParams>) => void;
  getCalculations: () => any;
}

export const useStore = create<AppState>((set, get) => ({
  userData: {
    course: '',
    tuition: 40000,
    livingStyle: 'medium',
    savings: 5000,
    expectedSalary: 60000,
  },
  setUserData: (data) =>
    set((state) => ({ userData: { ...state.userData, ...data } })),
  
  simulationParams: {
    salaryChangePercent: 0,
    interestRate: 5.5,
    placementDelayMonths: 0,
  },
  setSimulationParams: (params) =>
    set((state) => ({ simulationParams: { ...state.simulationParams, ...params } })),

  getCalculations: () => {
    const { userData, simulationParams } = get();
    
    // Living costs base
    const livingCostYearly = 
      userData.livingStyle === 'low' ? 10000 : 
      userData.livingStyle === 'medium' ? 15000 : 25000;
    
    // Assume 4 years
    const totalLiving = livingCostYearly * 4;
    const totalTuition = userData.tuition * 4;
    const misc = 5000; // 4 years
    const totalCost = totalLiving + totalTuition + misc;

    const loanRequired = Math.max(0, totalCost - userData.savings);
    
    // Standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    // Assume 10 years (120 months) repayment
    const monthlyRate = (simulationParams.interestRate / 100) / 12;
    const months = 120;
    
    const emi = loanRequired > 0 
      ? (loanRequired * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
      : 0;

    // Adjusted expected salary based on simulation
    const simulatedSalary = userData.expectedSalary * (1 + simulationParams.salaryChangePercent / 100);
    const monthlySalary = simulatedSalary / 12;

    const dtiRatio = monthlySalary > 0 ? (emi / monthlySalary) * 100 : 0; // Debt to Income ratio

    let riskLevel: 'Safe' | 'Moderate' | 'Risky' = 'Safe';
    if (dtiRatio > 30) riskLevel = 'Risky';
    else if (dtiRatio > 15) riskLevel = 'Moderate';

    // Break even time
    // Delay adds to the cost (lost wages + interest accrual)
    const extraLoanInterest = loanRequired * (simulationParams.interestRate / 100) * (simulationParams.placementDelayMonths / 12);
    const adjustedLoan = loanRequired + extraLoanInterest;

    return {
      totalCost,
      totalTuition,
      totalLiving,
      misc,
      loanRequired: adjustedLoan,
      emi,
      monthlySalary,
      dtiRatio,
      riskLevel,
      simulatedSalary
    };
  }
}));
