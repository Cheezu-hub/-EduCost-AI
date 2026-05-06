const simService = require('./simulations.service');
const { success } = require('../../utils/response');

class SimulationsController {
  async simulate(req, res, next) {
    try {
      const result = await simService.simulate(req.user.id, req.body);
      success(res, result, 'Simulation complete.');
    } catch (err) { next(err); }
  }

  async getSimulations(req, res, next) {
    try {
      const result = await simService.getSimulations(req.user.id);
      success(res, result);
    } catch (err) { next(err); }
  }
}

module.exports = new SimulationsController();
