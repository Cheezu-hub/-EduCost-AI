const adminService = require('./admin.service');
const { success } = require('../../utils/response');

class AdminController {
  async getAnalytics(req, res, next) {
    try {
      const analytics = await adminService.getAnalytics();
      success(res, analytics);
    } catch (err) { next(err); }
  }
}

module.exports = new AdminController();
