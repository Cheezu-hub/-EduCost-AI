const router = require('express').Router();
const ctrl = require('./colleges.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');

const createRules = [
  body('name').trim().notEmpty(),
  body('country').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('degreeTypes').isArray({ min: 1 }),
  body('tuitionAvg').isFloat({ min: 0 }),
  body('placementRate').isFloat({ min: 0, max: 100 }),
  body('avgSalary').isFloat({ min: 0 }),
];

router.get('/',     authenticate, ctrl.findAll);
router.get('/:id',  authenticate, ctrl.findOne);
router.post('/', authenticate, authorize('ADMIN'), validate(createRules), ctrl.create);

module.exports = router;
