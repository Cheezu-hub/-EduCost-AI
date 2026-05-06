const prisma = require('../../utils/prismaClient');
const { AppError } = require('../../middleware/errorHandler');

class UserService {
  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true, profile: true },
    });
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }

  async updateProfile(userId, data) {
    const { studentType, country, currency, familyIncome } = data;
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { studentType, country, currency, familyIncome },
      create: { userId, studentType, country, currency, familyIncome },
    });
    return profile;
  }
}

module.exports = new UserService();
