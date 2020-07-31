const express = require("express");
const router = express.Router();

const userController = require("./controllers/user");
const postController = require("./controllers/post");

router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

router.get("/create-post", userController.isAuth, postController.createNewPost);
router.post("/create-post", userController.isAuth, postController.create);
router.get("/post/:id", postController.viewSinglePost);
module.exports = router;
