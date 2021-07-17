const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

// models
const Post = require('../../models/Post');
const User = require('../../models/User');
const Category = require('../../models/Category');

dotenv.config({ path: './config.env' });

// db local
const dbLocal = process.env.DATABASE_LOCAL;

// db atlas
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// mongoDB connection
mongoose
  .connect(db, {
    // .connect(dbLocal, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`Connected to MongoDB → ${db}`));
// .then(() => console.log(`Connected to MongoDB → ${dbLocal}`));

// read JSON file
const posts = JSON.parse(fs.readFileSync(`${__dirname}/posts.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const categories = JSON.parse(
  fs.readFileSync(`${__dirname}/categories.json`, 'utf-8')
);

// import data into DB
const importData = async () => {
  try {
    await Post.create(posts);
    await Category.create(categories);
    await User.create(users, { validateBeforeSave: false });

    console.log('👍👍👍👍👍👍 Data successfully loaded! 👍👍👍👍👍👍');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
};

// delete all data from DB
const deleteData = async () => {
  try {
    console.log('😢😢 Goodbye Data...');

    await Post.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();

    console.log(
      'Data successfully deleted! To load sample data, run\n\n\t npm run sample\n\n'
    );
    process.exit();
  } catch (err) {
    console.log(
      '\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n'
    );
    console.error(err);
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
