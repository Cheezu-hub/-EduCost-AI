const { calculateCost, calculateLoan, calculateROI } = require('./calculations.engine');
const prisma = require('../../utils/prismaClient');

class CalculationsService {
  cost(input) {
    return calculateCost(input);
  }

  loan(input) {
    return calculateLoan(input);
  }

  roi(input) {
    return calculateROI(input);
  }
}

module.exports = new CalculationsService();
