const bcrypt = require('bcryptjs');
const prisma = require('../../utils/prismaClient');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { AppError } = require('../../middleware/errorHandler');

class AuthService {
  async register({ name, email, password }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered.', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'STUDENT' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const tokens = this._generateTokens(user.id, user.role);
    return { user, ...tokens };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid credentials.', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials.', 401);

    const { passwordHash, ...safeUser } = user;
    const tokens = this._generateTokens(user.id, user.role);
    return { user: safeUser, ...tokens };
  }

  async refresh(refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new AppError('User not found.', 401);

    return this._generateTokens(user.id, user.role);
  }

  _generateTokens(userId, role) {
    return {
      accessToken: signAccessToken({ userId, role }),
      refreshToken: signRefreshToken({ userId, role }),
    };
  }
}

module.exports = new AuthService();
