const reportsService = require('./reports.service');
const { success, created } = require('../../utils/response');

class ReportsController {
  async create(req, res, next) {
    try {
      const report = await reportsService.create(req.user.id, req.body);
      created(res, report, 'Report saved.');
    } catch (err) { next(err); }
  }
  async findAll(req, res, next) {
    try {
      const reports = await reportsService.findAll(req.user.id);
      success(res, reports);
    } catch (err) { next(err); }
  }
  async findOne(req, res, next) {
    try {
      const report = await reportsService.findOne(req.user.id, req.params.id);
      success(res, report);
    } catch (err) { next(err); }
  }
  async delete(req, res, next) {
    try {
      const result = await reportsService.delete(req.user.id, req.params.id);
      success(res, result, 'Report deleted.');
    } catch (err) { next(err); }
  }
}

module.exports = new ReportsController();
