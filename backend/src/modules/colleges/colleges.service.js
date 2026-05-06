const prisma = require('../../utils/prismaClient');
const { AppError } = require('../../middleware/errorHandler');
const { cacheGet, cacheSet } = require('../../utils/redis');

class CollegesService {
  async findAll({ country, tags, search, page = 1, limit = 20 }) {
    const cacheKey = `colleges:${JSON.stringify({ country, tags, search, page, limit })}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const where = {};
    if (country) where.country = country;
    if (tags && tags.length) where.tags = { hasSome: tags.split(',') };
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.college.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { ranking: 'asc' },
      }),
      prisma.college.count({ where }),
    ]);

    const result = { data, total, page, limit };
    await cacheSet(cacheKey, result, 600);
    return result;
  }

  async findOne(id) {
    const college = await prisma.college.findUnique({ where: { id } });
    if (!college) throw new AppError('College not found.', 404);
    return college;
  }

  async create(data) {
    return prisma.college.create({ data });
  }
}

module.exports = new CollegesService();
