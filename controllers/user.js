const UserModel = require("../models/UserModel");

exports.home = (req, res) => {
  res.render("home-guest");
};

exports.register = (req, res) => {
  let user = new UserModel(req.body);
  user.register();

  if (user.errors.length) {
    res.send(user.errors);
  } else {
    res.send("congratsss");
  }
};

exports.login = function (req, res) {
  let user = new UserModel(req.body)
  user.login()
};

exports.logout = function () {};
