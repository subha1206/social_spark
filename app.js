const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const router = require("./router");

const app = express();

let sessionOpt = session({
  secret: "JavaScripct is cool",
  store: new MongoStore({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  },
});

app.use(sessionOpt);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));

app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

module.exports = app;
