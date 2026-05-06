const router = require('express').Router();
const ctrl = require('./simulations.controller');
const { authenticate } = require('../../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');

const simRules = [
  body('tuitionPerYear').isFloat({ min: 0 }),
  body('duration').isInt({ min: 1 }),
  body('rent').isFloat({ min: 0 }),
  body('food').isFloat({ min: 0 }),
  body('transport').isFloat({ min: 0 }),
  body('insurance').isFloat({ min: 0 }),
  body('loanAmount').isFloat({ min: 0 }),
  body('annualInterestRate').isFloat({ min: 0 }),
  body('tenureYears').isInt({ min: 1 }),
  body('expectedSalary').isFloat({ min: 0 }),
];

router.post('/', authenticate, validate(simRules), ctrl.simulate);
router.get('/', authenticate, ctrl.getSimulations);

module.exports = router;
