const router = require('express').Router();
const ctrl = require('./auth.controller');
const { authLimiter } = require('../../middleware/rateLimiter');
const { validate } = require('../../middleware/validate');
const { body } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars.')
    .matches(/[A-Z]/).withMessage('Password needs uppercase.')
    .matches(/[0-9]/).withMessage('Password needs a number.'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', authLimiter, validate(registerRules), ctrl.register);
router.post('/login',    authLimiter, validate(loginRules),    ctrl.login);
router.post('/refresh',  authLimiter, validate([body('refreshToken').notEmpty()]), ctrl.refresh);

module.exports = router;
