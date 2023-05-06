const router = require("express").Router();
const User = require("../models/User");

// ユーザー情報の更新
router.put("/:id", async (req, res) => {
  const isCurrentUser = req.body.userId === req.params.id || req.body.isAdmin;
  if (!isCurrentUser)
    return res.status(403).json("正しいユーザーではありません");

  try {
    await User.findByIdAndUpdate(req.params.id, {
      $set: req.body, // 全更新可能
    });

    return res.status(200).json("ユーザー情報が更新されました");
  } catch (err) {
    return res.status(500).json(err);
  }
});

// ユーザー情報の削除
router.delete("/:id", async (req, res) => {
  const isCurrentUser = req.body.userId === req.params.id || req.body.isAdmin;
  if (!isCurrentUser)
    return res.status(403).json("正しいユーザーではありません");

  try {
    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json("ユーザー情報が削除されました");
  } catch (err) {
    return res.status(500).json(err);
  }
});

// ユーザー情報の取得
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // セキュリティ上不必要なデータを除外したデータのみにする
    const { password, updatedAt, ...other } = user._doc;

    return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// ユーザーのフォロー追加
router.put("/:id/follow", async (req, res) => {
  const isSelfUser = req.body.userId === req.params.id;
  if (isSelfUser) return res.status(403).json("自分自身をフォローできません");

  try {
    const selfUser = await User.findById(req.body.userId);
    const isFollowed = selfUser.followings.includes(req.params.id);
    if (isFollowed)
      return res.status(403).json("既にフォローしているユーザーです");

    // 更新処理の途中でインスタンス終了やタイムアウトで複数ユーザー処理が完全に完了しない可能性がある
    // 念のためログ出力を実施しておく
    await selfUser.updateOne({
      $push: {
        followings: req.params.id,
      },
    });
    console.log(
      `ユーザー【${req.body.userId}】のフォローリストにユーザー【${req.params.id}】を追加しました`
    );

    const targetUser = await User.findById(req.params.id);
    await targetUser.updateOne({
      $push: {
        followers: req.body.userId,
      },
    });
    console.log(
      `ユーザー【${req.params.id}】のフォロワーリストにユーザー【${req.body.userId}】を追加しました`
    );

    return res.status(200).json("フォローに成功しました");
  } catch (err) {
    console.error(
      `ユーザー【${req.body.userId}】がユーザー【${req.params.id}】をフォローする処理でエラーが発生しました。フォロー状態を確認してください`
    );

    return res.status(500).json(err);
  }
});

// ユーザーのフォロー解除
router.put("/:id/unfollow", async (req, res) => {
  const isSelfAccount = req.body.userId === req.params.id;
  if (isSelfAccount)
    return res.status(403).json("自分自身をフォロー解除できません");

  try {
    const selfUser = await User.findById(req.body.userId);
    const isFollowed = selfUser.followings.includes(req.params.id);
    if (!isFollowed)
      return res.status(403).json("フォローしていないユーザーです");

    // 更新処理の途中でインスタンス終了やタイムアウトで複数ユーザー処理が完全に完了しない可能性がある
    // 念のためログ出力を実施しておく
    await selfUser.updateOne({
      $pull: {
        followings: req.params.id,
      },
    });
    console.log(
      `ユーザー【${req.body.userId}】のフォローリストからユーザー【${req.params.id}】を削除しました`
    );

    const targetUser = await User.findById(req.params.id);
    await targetUser.updateOne({
      $pull: {
        followers: req.body.userId,
      },
    });
    console.log(
      `ユーザー【${req.params.id}】のフォロワーリストからユーザー【${req.body.userId}】を削除しました`
    );

    return res.status(200).json("フォロー解除に成功しました");
  } catch (err) {
    console.error(
      `ユーザー【${req.body.userId}】がユーザー【${req.params.id}】をフォロー解除する処理でエラーが発生しました。フォロー状態を確認してください`
    );

    return res.status(500).json(err);
  }
});

module.exports = router;
