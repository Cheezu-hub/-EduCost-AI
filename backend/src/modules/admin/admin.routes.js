const router = require('express').Router();
const ctrl = require('./admin.controller');
const { authenticate, authorize } = require('../../middleware/auth');

router.get('/analytics', authenticate, authorize('ADMIN'), ctrl.getAnalytics);

module.exports = router;
