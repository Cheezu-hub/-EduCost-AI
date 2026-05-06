const router = require('express').Router();
const ctrl = require('./user.controller');
const { authenticate } = require('../../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');

const profileRules = [
  body('studentType').optional().isIn(['DOMESTIC', 'INTERNATIONAL', 'ONLINE']),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('familyIncome').optional().isFloat({ min: 0 }),
];

router.get('/me', authenticate, ctrl.getMe);
router.put('/profile', authenticate, validate(profileRules), ctrl.updateProfile);

module.exports = router;
