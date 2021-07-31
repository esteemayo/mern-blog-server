const hpp = require('hpp');
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const multer = require('multer');
const helmet = require('helmet');
const xss = require('xss-clean');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// routes
const globalErrorHandler = require('./controllers/errorController');
const categoryRoute = require('./routes/categories');
const AppError = require('./utils/appError');
const userRoute = require('./routes/users');
const postRoute = require('./routes/posts');

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
  return cb(new AppError('Not an image! Please upload only images', 400), false);
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

app.use('/api/v1/users', userRoute);
app.use('/api/v1/posts', postRoute);
app.use('/api/v1/categories', categoryRoute);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
