require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const config = require('./config');
const logger = require('./utils/logger');
const prisma = require('./utils/prismaClient');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { defaultLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes         = require('./modules/auth/auth.routes');
const userRoutes         = require('./modules/users/user.routes');
const calculationRoutes  = require('./modules/calculations/calculations.routes');
const simulationRoutes   = require('./modules/simulations/simulations.routes');
const reportRoutes       = require('./modules/reports/reports.routes');
const collegeRoutes      = require('./modules/colleges/colleges.routes');
const aiRoutes           = require('./modules/ai/ai.routes');
const adminRoutes        = require('./modules/admin/admin.routes');

const app = express();

// ── Security ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(compression());

// ── Logging ──────────────────────────────────────────────
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Rate Limiting ─────────────────────────────────────────
app.use(defaultLimiter);

// ── Health Check ─────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', env: config.nodeEnv, timestamp: new Date().toISOString() })
);

// ── API Routes ───────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`,      authRoutes);
app.use(`${API}/user`,      userRoutes);
app.use(`${API}/calculate`, calculationRoutes);
app.use(`${API}/simulate`,  simulationRoutes);
app.use(`${API}/reports`,   reportRoutes);
app.use(`${API}/colleges`,  collegeRoutes);
app.use(`${API}/ai`,        aiRoutes);
app.use(`${API}/admin`,     adminRoutes);

// ── Error Handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Startup ───────────────────────────────────────────────
const start = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected');

    app.listen(config.port, () => {
      logger.info(`🚀 EduCost AI running on port ${config.port} [${config.nodeEnv}]`);
      logger.info(`📖 API base: http://localhost:${config.port}${API}`);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

start();

module.exports = app;
