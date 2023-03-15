import dotenv from 'dotenv';
import fs from 'fs';
import 'colors';

// models
import Post from '../../models/Post.js';
import User from '../../models/User.js';
import Category from '../../models/Category.js';
import User from '../../models/User.js';
import connectDB from '../../config/db.js';

dotenv.config({ path: './config.env' });

// mongoDB connection
connectDB();

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
    console.log('👍👍👍👍👍👍 Data successfully loaded! 👍👍👍👍👍👍'.blue.bold);
    process.exit();
  } catch (err) {
    console.log(
      '\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n'.red.bold
    );
    console.error(err);
    process.exit();
  }
};

// delete all data from DB
const deleteData = async () => {
  try {
    console.log('😢😢 Goodbye Data...'.blue.bold);
    await Post.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();
    console.log(
      'Data successfully deleted! To load sample data, run\n\n\t npm run sample\n\n'.green.bold
    );
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
