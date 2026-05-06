import { create } from 'zustand';
import { simulationApi, reportsApi, type SimulationInput } from '@/lib/api';
import { tokenStore } from '@/lib/api';

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

// Living cost map
const LIVING_COSTS = { low: 10000, medium: 15000, high: 25000 } as const;

// Monthly rent/food/transport breakdown per living style (used for backend calls)
const LIVING_BREAKDOWN = {
  low:    { rent: 650,  food: 300,  transport: 50,  insurance: 80  },
  medium: { rent: 1000, food: 400,  transport: 100, insurance: 100 },
  high:   { rent: 1800, food: 700,  transport: 200, insurance: 150 },
} as const;

interface AppState {
  userData: UserData;
  setUserData: (data: Partial<UserData>) => void;
  simulationParams: SimulationParams;
  setSimulationParams: (params: Partial<SimulationParams>) => void;

  // Local in-memory calculations (instant, no network)
  getCalculations: () => LocalCalcResult;

  // Backend-persisted actions (requires auth)
  saveSimulation: () => Promise<void>;
  saveReport: (title: string) => Promise<void>;

  // State for async backend ops
  isSaving: boolean;
  lastSavedAt: string | null;
  saveError: string | null;
}

export interface LocalCalcResult {
  totalCost: number;
  totalTuition: number;
  totalLiving: number;
  misc: number;
  loanRequired: number;
  emi: number;
  monthlySalary: number;
  dtiRatio: number;
  riskLevel: 'Safe' | 'Moderate' | 'Risky';
  simulatedSalary: number;
}

function computeLocal(userData: UserData, simulationParams: SimulationParams): LocalCalcResult {
  const livingCostYearly = LIVING_COSTS[userData.livingStyle];
  const totalLiving = livingCostYearly * 4;
  const totalTuition = userData.tuition * 4;
  const misc = 5000;
  const totalCost = totalLiving + totalTuition + misc;
  const loanRequired = Math.max(0, totalCost - userData.savings);

  const monthlyRate = (simulationParams.interestRate / 100) / 12;
  const months = 120;
  const emi = loanRequired > 0
    ? (loanRequired * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : 0;

  // Extra interest from placement delay
  const extraLoanInterest = loanRequired * (simulationParams.interestRate / 100) * (simulationParams.placementDelayMonths / 12);
  const adjustedLoan = loanRequired + extraLoanInterest;

  const simulatedSalary = userData.expectedSalary * (1 + simulationParams.salaryChangePercent / 100);
  const monthlySalary = simulatedSalary / 12;
  const dtiRatio = monthlySalary > 0 ? (emi / monthlySalary) * 100 : 0;

  let riskLevel: 'Safe' | 'Moderate' | 'Risky' = 'Safe';
  if (dtiRatio > 30) riskLevel = 'Risky';
  else if (dtiRatio > 15) riskLevel = 'Moderate';

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
    simulatedSalary,
  };
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
    return computeLocal(userData, simulationParams);
  },

  isSaving: false,
  lastSavedAt: null,
  saveError: null,

  saveSimulation: async () => {
    if (!tokenStore.getAccess()) return; // silently skip if not logged in
    const { userData, simulationParams } = get();
    const breakdown = LIVING_BREAKDOWN[userData.livingStyle];
    set({ isSaving: true, saveError: null });
    try {
      const body: SimulationInput = {
        tuitionPerYear: userData.tuition,
        duration: 4,
        ...breakdown,
        loanAmount: Math.max(0, userData.tuition * 4 + LIVING_COSTS[userData.livingStyle] * 4 + 5000 - userData.savings),
        annualInterestRate: simulationParams.interestRate,
        tenureYears: 10,
        expectedSalary: userData.expectedSalary,
        moratoriumMonths: simulationParams.placementDelayMonths,
        placementProbability: 0.85,
        salaryGrowthRate: 0.05,
        equipment: 500,
        misc: 100,
      };
      await simulationApi.run(body);
      set({ isSaving: false, lastSavedAt: new Date().toISOString() });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      set({ isSaving: false, saveError: msg });
    }
  },

  saveReport: async (title: string) => {
    if (!tokenStore.getAccess()) return;
    const { userData, simulationParams, getCalculations } = get();
    const calc = getCalculations();
    set({ isSaving: true, saveError: null });
    try {
      await reportsApi.create({
        title,
        type: 'simulation',
        payload: { userData, simulationParams, calc },
      });
      set({ isSaving: false, lastSavedAt: new Date().toISOString() });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save report';
      set({ isSaving: false, saveError: msg });
    }
  },
}));
