const bcrypt = require('bcryptjs');
const userCollection = require('../db').db().collection('users');
const validator = require('validator');
const { resolveInclude } = require('ejs');

let User = function (data) {
  this.data = data;
  this.errors = [];
};

User.prototype.cleanUpInput = function () {
  if (typeof this.data.username !== 'string') {
    this.data.username = '';
  }
  if (typeof this.data.email !== 'string') {
    this.data.email = '';
  }
  if (typeof this.data.password !== 'string') {
    this.data.password = '';
  }

  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  };
};

// NOTE: This is the validation function for the new user reg
User.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    if (this.data.username == '') {
      this.errors.push('You must provide a username.');
    }
    if (
      this.data.username != '' &&
      !validator.isAlphanumeric(this.data.username)
    ) {
      this.errors.push('Username can only contain letters and numbers.');
    }
    if (!validator.isEmail(this.data.email)) {
      this.errors.push('You must provide a valid email address.');
    }
    if (this.data.password == '') {
      this.errors.push('You must provide a password.');
    }
    if (this.data.password.length > 0 && this.data.password.length < 8) {
      this.errors.push('Password must be at least 12 characters.');
    }
    if (this.data.password.length > 50) {
      this.errors.push('Password cannot exceed 50 characters.');
    }
    if (this.data.username.length > 0 && this.data.username.length < 3) {
      this.errors.push('Username must be at least 3 characters.');
    }
    if (this.data.username.length > 30) {
      this.errors.push('Username cannot exceed 30 characters.');
    }

    if (
      this.data.username.length > 2 &&
      this.data.username.length < 31 &&
      validator.isAlphanumeric(this.data.username)
    ) {
      let usernameExists = await userCollection.findOne({
        username: this.data.username,
      });
      if (usernameExists) {
        this.errors.push('That username is already taken.');
      }
    }

    if (validator.isEmail(this.data.email)) {
      let emailExists = await userCollection.findOne({
        email: this.data.email,
      });
      if (emailExists) {
        this.errors.push('That email is already being used.');
      }
    }
    resolve();
  });
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
          resolve('Congrats!');
        } else {
          reject('Invalid username / password.');
        }
      })
      .catch((err) => {
        reject('Please try again leter.');
      });
  });
};
User.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    // Step #1: Validate user data
    this.cleanUpInput();
    await this.validate();

    // Step #2: Only if there are no validation errors
    // then save the user data into a database
    if (!this.errors.length) {
      // hash user password
      let salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      await userCollection.insertOne(this.data);
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

User.findByUserName = (username) => {
  return new Promise((resolve, reject) => {
    if (typeof username !== 'string') {
      reject();
      return;
    }
    userCollection
      .findOne({ username: username })
      .then((userDoc) => {
        if (userDoc) {
          userDoc = new User(userDoc, true);
          userDoc = {
            _id: userDoc.data._id,
            username: userDoc.data.username,
          };
          resolve(userDoc);
        } else {
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

module.exports = User;
