import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A category must have a name'],
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.models.Category ||
  mongoose.model('Category', categorySchema);

export default Category;
