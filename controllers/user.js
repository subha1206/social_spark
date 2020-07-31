const UserModel = require("../models/UserModel");
const userCollection = require("../db").db().collection("users");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("user-profile");

const checkFileType = (file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    return cb("Error: Img only");
  }
};

exports.register = (req, res) => {
  let user = new UserModel(req.body);
  user
    .register()
    .then(() => {
      req.session.user = { username: user.data.username };
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

exports.uploadImg = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      req.flash("errors_img", err);
      res.redirect("/");
    } else {
      if (req.file === undefined) {
        req.flash("errors_img", "Profile picture can not be empty");
        res.redirect("/");
      } else {
        userCollection
          .updateOne(
            { username: req.session.user.username },
            { $set: { p_img: req.file.path } }
          )
          .then(function (result) {
            req.session.user = {
              username: req.session.user.username,
              userImg: req.file.filename,
            };
          })
          .then((ress) => {
            res.redirect("/");
          });
      }
    }
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
