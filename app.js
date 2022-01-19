const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');
const cors = require('cors');

const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yaml'));

const app = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  req.headers.origin = req.headers.origin || req.headers.host;
  next();
});

const {
  UI_LOCAL_URL,
  UI_PROD_URL,
  DOCKER_AUTH_SERVICE_URL,
} = process.env;

const whitelist = [UI_LOCAL_URL, UI_PROD_URL, DOCKER_AUTH_SERVICE_URL];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
};

if (process.env.NODE_ENV === 'production') {
  app.use(cors(corsOptions));
}
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(':method [:status] :url  :response-time ms'));
}

app.use('/static', express.static('img'));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

require('./src/database');

app.use(require('./src/routes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message });
});

module.exports = app;
