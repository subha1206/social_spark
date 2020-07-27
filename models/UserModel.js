const bcrypt = require("bcryptjs");
const userCollection = require("../db").db().collection("users");
const validator = require("validator");
const { resolveInclude } = require("ejs");

let User = function (data) {
  this.data = data;
  this.errors = [];
};

User.prototype.cleanUpInput = function () {
  if (typeof this.data.username !== "string") {
    this.data.username = "";
  }
  if (typeof this.data.email !== "string") {
    this.data.email = "";
  }
  if (typeof this.data.password !== "string") {
    this.data.password = "";
  }

  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  };
};

// NOTE: This is the validation function for the new user reg
User.prototype.validate = function () {
  if (this.data.username == "") {
    this.errors.push("You must provide a username.");
  }
  if (
    this.data.username != "" &&
    !validator.isAlphanumeric(this.data.username)
  ) {
    this.errors.push("Username can only contain letters and numbers.");
  }
  if (!validator.isEmail(this.data.email)) {
    this.errors.push("You must provide a valid email address.");
  }
  if (this.data.password == "") {
    this.errors.push("You must provide a password.");
  }
  if (this.data.password.length > 0 && this.data.password.length < 8) {
    this.errors.push("Password must be at least 8 characters.");
  }
  if (this.data.password.length > 40) {
    this.errors.push("Password cannot exceed 40 characters.");
  }
  if (this.data.username.length > 0 && this.data.username.length < 3) {
    this.errors.push("Username must be at least 3 characters.");
  }
  if (this.data.username.length > 30) {
    this.errors.push("Username cannot exceed 30 characters.");
  }
};

User.prototype.login = function () {
  return new Promise((resolve, reject) => {
    this.cleanUpInput();
    userCollection
      .findOne({ username: this.data.username })
      .then((attemptedUser) => {
        if (
          attemptedUser &&
          bcrypt.compareSync(this.data.password, attemptedUser.password)
        ) {
          resolve("Congrats!");
        } else {
          reject("Invalid username / password.");
        }
      })
      .catch((err) => {
        reject("Please try again leter.");
      });
  });
};
User.prototype.register = function () {
  this.cleanUpInput();
  this.validate();

  if (!this.errors.length) {
    let salt = bcrypt.genSaltSync(10);
    this.data.password = bcrypt.hashSync(this.data.password, salt);
    userCollection.insertOne(this.data);
  }
};

module.exports = User;
