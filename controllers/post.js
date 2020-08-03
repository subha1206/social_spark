const PostModel = require("../models/PostModel.js");
const Post = require("../models/PostModel.js");

exports.createNewPost = (req, res) => {
  res.render("create-post");
};

exports.create = (req, res) => {
  let post = new PostModel(req.body, req.session.user._id);

  post
    .create()
    .then(() => {
      res.render("user-profile");
    })
    .catch((err) => {});
};

exports.viewSinglePost = async function (req, res) {
  try {
    let post = await Post.findSinglePost(req.params.id);

    res.render("single-post", { post: post });
  } catch (error) {
    res.render("error.ejs");
  }
};
