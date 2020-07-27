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
    })
    .then(() => {
      res.redirect("/");
    })
    .catch(function (err) {
      req.flash("errors", err);
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
};

exports.home = (req, res) => {
  if (req.session.user) {
    res.render("welcome", { username: req.session.user.username });
  } else {
    res.render("home-guest", { errors: req.flash("errors") });
  }
};
