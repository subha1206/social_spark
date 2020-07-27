const UserModel = require("../models/UserModel");

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
  let user = new UserModel(req.body);
  user
    .login()
    .then(function (result) {
      req.session.user = { username: user.data.username };
      res.send("hello")
    })
    .catch(function (err) {
      res.send(err);
    });
};

exports.logout = function () {};

exports.home = (req, res) => {
  if (req.session.user) {
    res.render("welcome.ejs");
  } else {
    res.render("home-guest");
  }
};
