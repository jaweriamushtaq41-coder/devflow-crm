const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');

async function start() {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log('✅ Database connection established.');

    // In development, sync models automatically. In production, use
    // `npm run migrate` with proper Sequelize migrations instead.
    if (env.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      // eslint-disable-next-line no-console
      console.log('✅ Models synced (development mode).');
    }

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 DevFlow CRM API listening on http://localhost:${env.port}`);
      // eslint-disable-next-line no-console
      console.log(`   Health check: http://localhost:${env.port}/health`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Unable to start server:', err);
    process.exit(1);
  }
}

start();
