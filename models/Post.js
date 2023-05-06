const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      min: 1,
      max: 200,
      required: true,
    },
    // TODO: 複数の画像にしたい
    imgPath: {
      type: String,
      default: "",
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("Post", PostSchema);
