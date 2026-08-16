const userService = require('../services/user.service');
const { successResponse } = require('../utils/response.util');

class UserController {
  async getMe(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.id);
      return successResponse(res, user, 'User profile retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req, res, next) {
    try {
      const updatedUser = await userService.updateProfile(req.user.id, req.body);
      return successResponse(res, updatedUser, 'User profile updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

const userController = new UserController();
module.exports = userController;
