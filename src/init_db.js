const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const initDB = function () {
  const DB_FILE = 'notify.json';
  const targetDbDir = path.resolve(__dirname, '../db');
  
  if (!fs.existsSync(targetDbDir)) {
    fs.mkdirSync(targetDbDir);
  }
  
  const adapter = new FileSync(path.resolve(targetDbDir, DB_FILE));
  
  const db = low(adapter);
  db.defaults({'tasks': []}).write();

  return db;
};

module.exports = {
  initDB
};