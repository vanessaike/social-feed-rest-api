const Post = require("../models/post");
const User = require("../models/user");
const {throwError} = require("../helpers/error");
const {errorHandling} = require("../helpers/error");
const {validationResult} = require("express-validator");

exports.getPosts = async function (req, res, next) {
  try {
    const posts = await Post.find().sort({createdAt: -1}).populate("creator");

    res.status(200).json({posts: posts});
  } catch (error) {
    errorHandling(error, next);
  }
};

exports.getPost = async function (req, res, next) {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      throwError("No post found.", 404);
    }

    res.status(200).json({message: "Post successfully fetched.", post: post});
  } catch (error) {
    errorHandling(error, next);
  }
};

exports.addPost = async function (req, res, next) {
  const content = req.body.content;
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      throwError("Enter a valid post. (Min. length: 1, max. length: 50)", 422);
    }

    const post = new Post({
      content: content,
      creator: req.userId,
    });
    const savedPost = await post.save();
    const user = await User.findById(req.userId);

    if (!user) {
      throwError("User not found", 404);
    }

    user.posts.push(savedPost);
    await user.save();

    res.status(201).json({message: "Post successfully added.", post: post});
  } catch (error) {
    errorHandling(error, next);
  }
};

exports.deletePost = async function (req, res, next) {
  const postId = req.params.postId;

  try {
    const user = await User.findById(req.userId);
    const post = await Post.findById(postId);

    if (!user) {
      throwError("No user found.", 404);
    }

    if (!post) {
      throwError("No post found.", 404);
    }

    if (post.creator.toString() !== req.userId.toString()) {
      throwError("Cannot delete post.", 403);
    }

    await Post.findByIdAndRemove(postId);
    user.posts.pull(postId);
    await user.save();

    res.status(200).json({message: "Post deleted successfully"});
  } catch (error) {
    errorHandling(error, next);
  }
};

exports.editPost = async function (req, res, next) {
  const postId = req.params.postId;
  const updatedContent = req.body.content;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      throwError("No post found.", 404);
    }
    if (post.creator.toString() !== req.userId.toString()) {
      throwError("Cannot edit post.", 403);
    }

    post.content = updatedContent;
    const updatedPost = await post.save();
    res.status(200).json({message: "Post updated successfully.", post: updatedPost});
  } catch (error) {
    errorHandling(error, next);
  }
};
