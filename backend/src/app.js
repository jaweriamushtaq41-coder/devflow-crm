const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const env = require('./config/env');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();
app.set('trust proxy', 1);

// Allow the configured client URL and any devflow-crm-*.vercel.app frontend.
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed =
        origin === env.clientUrl ||
        /^https:\/\/devflow-crm-[a-z0-9-]+\.vercel\.app$/.test(origin);
      return cb(null, allowed);
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// Static file serving for uploaded attachments (local/dev storage).
app.use('/uploads', express.static(path.join(__dirname, env.upload.dir)));

app.get('/health', (req, res) => res.json({ success: true, message: 'DevFlow CRM API is running', env: env.nodeEnv }));

app.use('/api/v1', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
