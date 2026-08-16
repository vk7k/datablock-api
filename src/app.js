const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const env = require('./config/env');

const app = express();

// ==========================================
// Middleware Stack
// ==========================================

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman) or matched origins
    if (!origin || env.NODE_ENV === 'development' || origin === env.FRONTEND_URL) {
      return callback(null, true);
    }
    // Allow any origin if in permissive mode or add specific whitelist checks
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// HTTP Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load OpenAPI Specification
const openApiSpecPath = path.join(__dirname, '../openapi.yaml');
let swaggerDocument;
try {
  swaggerDocument = YAML.load(openApiSpecPath);
} catch (err) {
  console.warn('[Swagger] Could not load openapi.yaml:', err.message);
}

// Base Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Polymorphic Block Management API',
    docs: '/api/docs',
    health: '/api/health',
    version: '1.0.0',
  });
});

// Swagger UI & OpenAPI Specification Endpoints
if (swaggerDocument) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'DataBlock API Documentation (Swagger)',
  }));
  app.get('/api/docs/openapi.json', (req, res) => res.json(swaggerDocument));
  app.get('/openapi.json', (req, res) => res.json(swaggerDocument));
  app.get('/openapi.yaml', (req, res) => res.sendFile(openApiSpecPath));
}

// API Routes Mounting
app.use('/api', apiRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
