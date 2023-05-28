const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// 新規投稿をする
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();

    return res.status(200).json(savedPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 投稿を編集する
router.put("/:id", async (req, res) => {
  try {
    const targetPost = await Post.findById(req.params.id);
    if (!targetPost) return res.status(404).json("対象の投稿は存在しません");
    const isSelfUser = targetPost.userId === req.body.userId;
    if (!isSelfUser)
      return res.status(403).json("他のユーザーの投稿を編集できません");

    await targetPost.updateOne({
      $set: req.body,
    });

    return res.status(200).json("投稿の編集に成功しました");
  } catch (err) {
    return res.status(500).json(err);
  }
});

//　投稿を削除する
router.delete("/:id", async (req, res) => {
  try {
    const targetPost = await Post.findById(req.params.id);
    if (!targetPost) return res.status(404).json("対象の投稿は存在しません");
    const isSelfUser = targetPost.userId === req.body.userId;
    if (!isSelfUser)
      return res.status(403).json("他のユーザーの投稿を削除できません");

    await targetPost.deleteOne();

    return res.status(200).json("投稿の削除に成功しました");
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 特定の投稿を1つ取得する
router.get("/:id", async (req, res) => {
  try {
    const targetPost = await Post.findById(req.params.id);
    if (!targetPost) return res.status(404).json("対象の投稿は存在しません");

    return res.status(200).json(targetPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// プロフィールで表示するユーザーのみのタイムラインを取得
router.get("/profile/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const currentUserPosts = await Post.find({ userId: currentUser._id });

    // 自分投稿配列を降順で並び替えする
    const timeline = currentUserPosts.sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    );

    return res.status(200).json(timeline);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 特定ユーザーとそのフォロワーのタイムラインを取得する
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const currentUserPosts = await Post.find({ userId: currentUser._id });
    // where in はできない？
    const followingUserPosts = await Promise.all(
      currentUser.followings.map((userId) => Post.find({ userId }))
    );
    // 自分とフォローしてる人の投稿配列を降順で並び替えする
    const timeline = currentUserPosts
      .concat(...followingUserPosts)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return res.status(200).json(timeline);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 特定の投稿のイイネ(likes)に追加/削除する
router.put("/:id/like", async (req, res) => {
  try {
    const targetPost = await Post.findById(req.params.id);
    if (!targetPost) return res.status(404).json("対象の投稿は存在しません");

    const isLikedPost = targetPost.likes.includes(req.body.userId);
    if (isLikedPost) {
      await targetPost.updateOne({
        $pull: {
          likes: req.body.userId,
        },
      });

      return res.status(200).json("イイネを削除しました");
    } else {
      await targetPost.updateOne({
        $push: {
          likes: req.body.userId,
        },
      });

      return res.status(200).json("イイネを追加しました");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
