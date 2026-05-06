const router = require('express').Router();
const ctrl = require('./ai.controller');
const { authenticate } = require('../../middleware/auth');
const { aiLimiter } = require('../../middleware/rateLimiter');
const { body } = require('express-validator');
const { validate } = require('../../middleware/validate');

router.post('/chat',
  authenticate,
  aiLimiter,
  validate([body('message').trim().notEmpty().isLength({ max: 2000 })]),
  ctrl.chat
);
router.get('/history', authenticate, ctrl.getHistory);
router.delete('/history', authenticate, ctrl.clearHistory);

module.exports = router;
