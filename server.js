const express = require("express");
const app = express();
const PORT = 8000;
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// Database
mongoose
  .connect(process.env.MONGOURL)
  .then(() => {
    console.log("DBと接続中・・・");
  })
  .catch((e) => {
    console.error(e);
    console.error("DBとの接続に失敗しました");
  });

// Middleware
const router = {
  auth: require("./routes/auth"),
  posts: require("./routes/posts"),
  users: require("./routes/users"),
  upload: require("./routes/upload"),
};
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/api/auth", router.auth);
app.use("/api/posts", router.posts);
app.use("/api/users", router.users);
app.use("/api/upload", router.upload);

app.listen(PORT, () => console.log("サーバーが起動しました"));
