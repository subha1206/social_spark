const UserModel = require("../models/UserModel");

exports.register = (req, res) => {
  let user = new UserModel(req.body);
  user
    .register()
    .then(() => {
      req.session.user = { username: user.data.username, _id: user.data._id };
      req.session.save(function () {
        res.redirect("/");
      });
    })
    .catch((regErrors) => {
      regErrors.forEach(function (error) {
        req.flash("reg_errors", error);
      });
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.login = function (req, res) {
  let user = new UserModel(req.body);
  user
    .login()
    .then(function (result) {
      req.session.user = { username: user.data.username, _id: user.data._id };
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

exports.isAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You Must be logged In to perform the action");
    req.session.save(() => {
      res.redirect("/");
    });
  }
};
exports.home = (req, res) => {
  if (req.session.user) {
    res.render("welcome", {
      errors_img: req.flash("errors_img"),
    });
  } else {
    res.render("home-guest", {
      errors: req.flash("errors"),
      reg_error: req.flash("reg_errors"),
    });
  }
};
