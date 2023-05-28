const router = require("express").Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `public/images/${req.body.dir}`);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// ユーザー情報の更新
router.post("/", upload.single("file"), async (req, res) => {
  try {
    return res.status(200).json("画像のアップロードに成功しました");
  } catch (e) {
    console.error(e);
  }
});

module.exports = router;
