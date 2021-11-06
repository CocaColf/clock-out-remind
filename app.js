const express = require('express');
const { createSchedule } = require('./src/cureate_schedule');
const { initDB } = require('./src/init_db');
const { formatTime } = require('./src/utils');
const cors = require('cors');

const { clockOutSettings, port } = require('./config.json');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(express.static('public'))

const db = initDB();

// 固定循环提醒
createSchedule(
  db,
  clockOutSettings.defaultHour,
  clockOutSettings.defaultMinute,
  clockOutSettings.defaultWorkDay
);

app.post('/setTask', (req, res) => {
  const { hour, minute } = req.body;
  const today = formatTime();

  db.get('tasks').find({
    today,
  }).assign({
    next: {
      hour,
      minute,
    }
  }).write();

  createSchedule(db, hour, minute);

  res.send(true);
});

app.get('/confirm', (req, res) => {
  const today = formatTime();

  db.get('tasks').find({
    today,
  }).assign({
    confirm: true
  }).write();

  res.send(true);
});

app.get('/notify', (req, res) => {
  const today = formatTime();
  const data = db.get('tasks')
    .find({
      today
    }).value();

  res.send(data);
});

app.listen(port);