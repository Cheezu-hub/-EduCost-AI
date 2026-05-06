const authService = require('./auth.service');
const { success, created } = require('../../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      created(res, result, 'Registration successful.');
    } catch (err) { next(err); }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      success(res, result, 'Login successful.');
    } catch (err) { next(err); }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refresh(refreshToken);
      success(res, tokens, 'Tokens refreshed.');
    } catch (err) { next(err); }
  }
}

module.exports = new AuthController();
