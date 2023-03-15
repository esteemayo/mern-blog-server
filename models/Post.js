import slugify from 'slugify';
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A post must have a title'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'A post must have a description'],
    },
    username: {
      type: String,
      required: [true, 'A post must must have a username'],
    },
    category: {
      type: String,
      required: [true, 'A post must belong to a category'],
    },
    photo: String,
  },
  {
    timestamps: true,
  }
);

postSchema.index({ title: 1, categories: 1 });
postSchema.index({ slug: -1 });

postSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();

  this.slug = slugify(this.title, { lower: true });

  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const postWithSlug = await this.constructor.find({ slug: slugRegEx });

  if (postWithSlug.length) {
    this.slug = `${this.slug}-${postWithSlug.length + 1}`;
  }
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
