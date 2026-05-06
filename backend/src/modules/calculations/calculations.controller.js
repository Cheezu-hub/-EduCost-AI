const calcService = require('./calculations.service');
const { success } = require('../../utils/response');

class CalculationsController {
  async cost(req, res, next) {
    try {
      const result = calcService.cost(req.body);
      success(res, result, 'Cost calculated.');
    } catch (err) { next(err); }
  }

  async loan(req, res, next) {
    try {
      const result = calcService.loan(req.body);
      success(res, result, 'Loan calculated.');
    } catch (err) { next(err); }
  }

  async roi(req, res, next) {
    try {
      const result = calcService.roi(req.body);
      success(res, result, 'ROI analysed.');
    } catch (err) { next(err); }
  }
}

module.exports = new CalculationsController();
