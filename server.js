const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 🔥 Shutting down.....'.red.bold);
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// db local
const dbLocal = process.env.DATABASE_LOCAL;

// db atlas
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// mongoDB connection
mongoose
  .connect(db)
  .then(() => console.log(`Connected to MongoDB → ${db}`.gray.bold));

app.set('port', process.env.PORT || 8080);

const server = app.listen(app.get('port'), () =>
  console.log(`Server running at port → ${server.address().port}`.blue.bold)
);

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 🔥 Shutting down.....'.red.bold);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
