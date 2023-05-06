const express = require("express");
const app = express();
const PORT = 3000;
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
};
app.use(express.json());
app.use("/api/auth", router.auth);
app.use("/api/posts", router.posts);
app.use("/api/users", router.users);

app.listen(PORT, () => console.log("サーバーが起動しました"));
