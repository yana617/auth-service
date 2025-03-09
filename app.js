import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import cors from 'cors';

import router from '#routes';
import '#database';

const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yaml'));

const app = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  req.headers.origin = req.headers.origin || req.headers.host;
  next();
});

const {
  PORT,
  UI_LOCAL_URL,
  UI_PROD_URL,
  DOCKER_AUTH_SERVICE_URL,
} = process.env;

const whitelist = [UI_LOCAL_URL, UI_PROD_URL, DOCKER_AUTH_SERVICE_URL];
if (process.env.NODE_ENV !== 'production') {
  const POSTMAN_URL = `localhost:${PORT}`;
  whitelist.push(POSTMAN_URL);
}

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

app.use(router);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message });
});

export default app;
