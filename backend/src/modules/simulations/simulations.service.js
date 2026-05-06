const { calculateCost, calculateLoan, calculateROI } = require('../calculations/calculations.engine');
const prisma = require('../../utils/prismaClient');

class SimulationsService {
  /**
   * Run a "what-if" simulation by modifying base parameters and recomputing everything.
   */
  async simulate(userId, params) {
    const {
      // Cost inputs
      tuitionPerYear, duration, rent, food, transport, insurance,
      equipment = 0, misc = 0, inflation = 0.04,
      // Loan inputs
      loanAmount, annualInterestRate, tenureYears, moratoriumMonths = 0,
      // ROI inputs
      expectedSalary, salaryGrowthRate = 0.05, placementProbability = 0.85,
      // Simulation overrides (deltas applied to base)
      salaryAdjustment = 0,       // e.g. -10000
      interestRateAdjustment = 0, // e.g. +1 (percent)
      startDelayYears = 0,        // years before starting repayment
      expenseAdjustment = 0,      // monthly living cost delta
    } = params;

    // Apply adjustments
    const adjSalary = expectedSalary + salaryAdjustment;
    const adjRate = annualInterestRate + interestRateAdjustment;
    const adjRent = rent + expenseAdjustment;
    const adjMoratorium = moratoriumMonths + startDelayYears * 12;

    const costResult = calculateCost({
      tuitionPerYear, duration, rent: adjRent, food, transport,
      insurance, equipment, misc, inflation,
    });

    const loanResult = calculateLoan({
      principal: loanAmount,
      annualInterestRate: adjRate,
      tenureYears,
      moratoriumMonths: adjMoratorium,
    });

    const roiResult = calculateROI({
      expectedSalary: adjSalary,
      salaryGrowthRate,
      placementProbability,
      loanAmount,
      annualInterestRate: adjRate,
      tenureYears,
      totalCost: costResult.grandTotal,
      moratoriumMonths: adjMoratorium,
    });

    const output = {
      adjustments: { salaryAdjustment, interestRateAdjustment, startDelayYears, expenseAdjustment },
      cost: costResult,
      loan: loanResult,
      roi: roiResult,
    };

    // Persist simulation
    const simulation = await prisma.loanSimulation.create({
      data: {
        userId,
        inputsJson: params,
        outputsJson: output,
      },
    });

    return { simulationId: simulation.id, ...output };
  }

  async getSimulations(userId) {
    return prisma.loanSimulation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}

module.exports = new SimulationsService();
