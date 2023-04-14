const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

var exerciseSchema = new mongoose.Schema({
  date: Date,
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  userId: String,
});

var UserModel = mongoose.model("UserModel", userSchema);
var ExerciseModel = mongoose.model("ExerciseModel", exerciseSchema);

app.post("/api/users", async (req, res) => {
  if (req.body.username === "") res.json({ error: null });
  else {
    const user = new UserModel({
      username: req.body.username,
    });
    var a = await user.save();
    res.json({
      username: req.body.username,
      _id: a._id.toString(),
    });
  }
});

app.get("/api/users", async (req, res) => {
  var result = await UserModel.find({}).exec();
  res.send(result);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  if (
    req.body.description === null ||
    req.body.duration === null ||
    (req.body.date !== "" && new Date(req.body.date) == "Invalid Date")
  )
    res.json({ error: null });
  else {
    var user = await UserModel.findById(req.params._id).exec();
    if (user === null) return console.log(null);
    var date;
    if (req.body.date === "") date = new Date(Date.now());
    else date = new Date(req.body.date);
    var exercise = new ExerciseModel({
      date: date,
      description: req.body.description,
      duration: parseInt(req.body.duration),
      userId: req.params._id,
    });
    exercise.save();
    res.json({
      _id: req.params._id,
      username: user.username,
      date: new Date(date).toDateString(),
      description: req.body.description,
      duration: parseInt(req.body.duration),
    });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  var from = req.query.from ? new Date(req.query.from) : null;
  var to = req.query.to ? new Date(req.query.to) : null;
  var limit = req.query.limit ? parseInt(req.query.limit) : null;
  var user;
  try {
    user = await UserModel.findById(req.params._id).exec();
  } catch (err) {
    return res.json({ error: null });
  }
  var exercises = await ExerciseModel.find({
    userId: req.params._id,
  }).exec();
  if (exercises.length === 0)
    res.json({
      _id: req.params._id,
      username: user.username,
      count: 0,
      log: [],
    });
  else {
    var count = exercises.length;
    if (limit)
      exercises = await ExerciseModel.find({
        userId: req.params._id,
      })
        .limit(limit)
        .exec();
    if (from) {
      exercises = exercises.filter((item) => {
        return item.date >= from;
      });
    }
    if (to) {
      exercises = exercises.filter((item) => {
        return item.date <= to;
      });
    }
    res.json({
      _id: req.params._id,
      username: user.username,
      count: count,
      log: exercises.map((item) => {
        return {
          description: item.description,
          duration: item.duration,
          date: new Date(item.date).toDateString(),
        };
      }),
    });
  }
});

app.get("/dm", async (req, res) => {
  res.send(await UserModel.find({}).exec());
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
