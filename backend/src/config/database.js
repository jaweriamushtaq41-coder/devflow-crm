const { Sequelize } = require('sequelize');
const env = require('./env');

// Prefer a full connection string (DATABASE_URL) if provided, otherwise
// fall back to discrete host/user/password/db settings. This mirrors how
// most hosting providers (Render, Railway, Heroku) inject Postgres config.
const sequelize = env.db.url
  ? new Sequelize(env.db.url, {
      dialect: 'postgres',
      dialectModule: require('pg'),
      logging: env.nodeEnv === 'development' ? console.log : false,
      dialectOptions:
        env.nodeEnv === 'production'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
    })
  : new Sequelize(env.db.name, env.db.user, env.db.password, {
      host: env.db.host,
      port: env.db.port,
      dialect: 'postgres',
      logging: env.nodeEnv === 'development' ? console.log : false,
    });

module.exports = sequelize;
