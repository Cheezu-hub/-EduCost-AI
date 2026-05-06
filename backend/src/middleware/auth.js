const { verifyAccessToken } = require('../utils/jwt');
const { AppError } = require('./errorHandler');
const prisma = require('../utils/prismaClient');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) throw new AppError('No token provided.', 401);

    const token = header.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new AppError('User not found.', 401);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden: insufficient permissions.', 403));
  }
  next();
};

module.exports = { authenticate, authorize };
