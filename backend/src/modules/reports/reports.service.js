const prisma = require('../../utils/prismaClient');
const { AppError } = require('../../middleware/errorHandler');

class ReportsService {
  async create(userId, { title, type, payload }) {
    return prisma.report.create({
      data: { userId, title, type, payloadJson: payload },
    });
  }

  async findAll(userId) {
    return prisma.report.findMany({
      where: { userId },
      select: { id: true, title: true, type: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId, id) {
    const report = await prisma.report.findFirst({ where: { id, userId } });
    if (!report) throw new AppError('Report not found.', 404);
    return report;
  }

  async delete(userId, id) {
    const report = await prisma.report.findFirst({ where: { id, userId } });
    if (!report) throw new AppError('Report not found.', 404);
    await prisma.report.delete({ where: { id } });
    return { deleted: true };
  }
}

module.exports = new ReportsService();
