const router = require('express').Router();
const ctrl = require('./calculations.controller');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { body } = require('express-validator');

const costRules = [
  body('tuitionPerYear').isFloat({ min: 0 }),
  body('duration').isInt({ min: 1, max: 10 }),
  body('rent').isFloat({ min: 0 }),
  body('food').isFloat({ min: 0 }),
  body('transport').isFloat({ min: 0 }),
  body('insurance').isFloat({ min: 0 }),
  body('equipment').optional().isFloat({ min: 0 }),
  body('misc').optional().isFloat({ min: 0 }),
  body('inflation').optional().isFloat({ min: 0, max: 0.3 }),
];

const loanRules = [
  body('principal').isFloat({ min: 1000 }),
  body('annualInterestRate').isFloat({ min: 0, max: 50 }),
  body('tenureYears').isInt({ min: 1, max: 30 }),
  body('moratoriumMonths').optional().isInt({ min: 0, max: 84 }),
];

const roiRules = [
  body('expectedSalary').isFloat({ min: 0 }),
  body('loanAmount').isFloat({ min: 0 }),
  body('annualInterestRate').isFloat({ min: 0, max: 50 }),
  body('tenureYears').isInt({ min: 1, max: 30 }),
  body('totalCost').isFloat({ min: 0 }),
  body('placementProbability').optional().isFloat({ min: 0, max: 1 }),
  body('salaryGrowthRate').optional().isFloat({ min: 0, max: 1 }),
];

router.post('/cost', authenticate, validate(costRules), ctrl.cost);
router.post('/loan', authenticate, validate(loanRules), ctrl.loan);
router.post('/roi',  authenticate, validate(roiRules),  ctrl.roi);

module.exports = router;
