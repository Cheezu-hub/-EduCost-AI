const collegesService = require('./colleges.service');
const { success, created, paginated } = require('../../utils/response');

class CollegesController {
  async findAll(req, res, next) {
    try {
      const { country, tags, search, page = 1, limit = 20 } = req.query;
      const result = await collegesService.findAll({
        country, tags, search,
        page: parseInt(page), limit: parseInt(limit),
      });
      paginated(res, result.data, result.total, result.page, result.limit);
    } catch (err) { next(err); }
  }

  async findOne(req, res, next) {
    try {
      const college = await collegesService.findOne(req.params.id);
      success(res, college);
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const college = await collegesService.create(req.body);
      created(res, college, 'College added.');
    } catch (err) { next(err); }
  }
}

module.exports = new CollegesController();
