const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");
const {body} = require("express-validator");

const validation = [body("content").trim().isLength({min: 1, max: 50})];

router.get("/posts", isAuth, feedController.getPosts);
router.put("/add-post", validation, isAuth, feedController.addPost);
router.get("/post/:postId", isAuth, feedController.getPost);
router.delete("/post/:postId", isAuth, feedController.deletePost);
router.patch("/post/:postId", validation, isAuth, feedController.editPost);

module.exports = router;
