const router = require('express').Router();
const ctrl = require('./reports.controller');
const { authenticate } = require('../../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');

const createRules = [
  body('title').trim().notEmpty(),
  body('type').isIn(['cost', 'loan', 'roi', 'simulation', 'custom']),
  body('payload').isObject(),
];

router.post('/',    authenticate, validate(createRules), ctrl.create);
router.get('/',     authenticate, ctrl.findAll);
router.get('/:id',  authenticate, ctrl.findOne);
router.delete('/:id', authenticate, ctrl.delete);

module.exports = router;
