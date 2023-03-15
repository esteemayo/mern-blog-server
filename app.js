import express from 'express';
import hpp from 'hpp';
import multer from 'multer';
import cors from 'cors';
import compression from 'compression';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: './config.env' });

// routes
import categoryRoute from './routes/categories.js';
import errorHandlerMiddleware from './controllers/errorController.js';
import userRoute from './routes/users.js';
import BadRequestError from './errors/badRequest.js';
import postRoute from './routes/posts.js';
import NotFoundError from './errors/notFound.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// start express app
const app = express();

// global middlewares
// implement CORS
app.use(cors());

// access-control-allow-origin
app.options('*', cors());

// set security http headers
app.use(helmet());

// development logging
if (app.get('env') === 'development') {
  app.use(logger('dev'));
}

app.use('/images', express.static(path.join(`${__dirname}/images`)));

// limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too much requests from this IP. Please try again in an hour.',
});

app.use('/api', limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// cookie-parser
app.use(cookieParser());

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent prameter pollution
app.use(
  hpp({
    whitelist: ['name', 'title', 'description', 'categories'],
  })
);

// compression middleware
app.use(compression());

// test middleware
app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  //   console.log(req.headers);
  //   console.log(req.cookies);

  next();
});

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  }
  return cb(new BadRequestError('Not an image! Please upload only images'), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

app.post('/api/v1/upload', upload.single('file'), (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'File has been uploaded!',
  });
});

// api routes
app.use('/api/v1/users', userRoute);
app.use('/api/v1/posts', postRoute);
app.use('/api/v1/categories', categoryRoute);

app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server`));
});

app.use(errorHandlerMiddleware);

export default app;
