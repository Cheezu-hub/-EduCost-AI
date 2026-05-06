const userService = require('./user.service');
const { success } = require('../../utils/response');

class UserController {
  async getMe(req, res, next) {
    try {
      const user = await userService.getMe(req.user.id);
      success(res, user);
    } catch (err) { next(err); }
  }

  async updateProfile(req, res, next) {
    try {
      const profile = await userService.updateProfile(req.user.id, req.body);
      success(res, profile, 'Profile updated.');
    } catch (err) { next(err); }
  }
}

module.exports = new UserController();
