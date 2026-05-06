const aiService = require('./ai.service');
const { success } = require('../../utils/response');

class AIController {
  async chat(req, res, next) {
    try {
      const result = await aiService.chat(req.user.id, req.body);
      success(res, result);
    } catch (err) { next(err); }
  }

  async getHistory(req, res, next) {
    try {
      const history = await aiService.getHistory(req.user.id);
      success(res, history);
    } catch (err) { next(err); }
  }

  async clearHistory(req, res, next) {
    try {
      const result = await aiService.clearHistory(req.user.id);
      success(res, result, 'Chat history cleared.');
    } catch (err) { next(err); }
  }
}

module.exports = new AIController();
