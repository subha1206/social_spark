const postCollection = require("../db").db().collection("posts");
const ObjectID = require("mongodb").ObjectID;

let Post = function (data, userId) {
  this.data = data;
  this.userId = userId;
  this.errors = [];
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title !== "string") {
    this.data.title = "";
  }
  if (typeof this.data.body !== "string") {
    this.data.body = "";
  }

  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdAt: new Date(),
    author: ObjectID(this.userId),
  };
};

Post.prototype.validate = function () {
  if (this.data.title === "") {
    this.errors.push("You must provide a title");
  }
  if (this.data.body === "") {
    this.errors.push("You must provide type some blog");
  }
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      postCollection
        .insertOne(this.data)
        .then(() => {
          resolve();
        })
        .catch(() => {
          this.errors.push("Please try again letter");
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

Post.findSinglePost = (id) => {
  return new Promise(async function (resolve, reject) {
    if (typeof id !== "string" || !ObjectID.isValid(id)) {
      reject();
      return;
    }

    let posts = await postCollection
      .aggregate([
        { $match: { _id: new ObjectID(id) } },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorDoc",
          },
        },
        {
          $project: {
            title: 1,
            body: 1,
            createdAt: 1,
            author: { $arrayElemAt: ["$authorDoc", 0] },
          },
        },
      ])
      .toArray();
    if (posts.length) {
      console.log(posts[0]);
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

module.exports = Post;
