const prisma = require('../../utils/prismaClient');

class AdminService {
  async getAnalytics() {
    const [
      totalUsers,
      totalColleges,
      totalReports,
      totalSimulations,
      recentUsers,
      roleBreakdown,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.college.count(),
      prisma.report.count(),
      prisma.loanSimulation.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
    ]);

    const reportsByType = await prisma.report.groupBy({
      by: ['type'],
      _count: { type: true },
    });

    return {
      totals: { users: totalUsers, colleges: totalColleges, reports: totalReports, simulations: totalSimulations },
      recentUsers,
      usersByRole: roleBreakdown,
      reportsByType,
    };
  }
}

module.exports = new AdminService();
