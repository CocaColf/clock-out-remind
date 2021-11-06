const axios = require('axios').default;
const { clockOutSettings } = require('../config.json');
const { logger } = require('./create_logger');

const formatTime = (time = +new Date()) => {
  // 东八区时间
  const date = new Date(time + 8 * 3600 * 1000);

  return date.toJSON().substr(0, 10).replace(/-/g, '');
};

const sendMessage = async (message = clockOutSettings.defaultNotifyContent, title = clockOutSettings.defaultNotifyTitle) => {
  try {
    await axios.get(`https://api.day.app/${clockOutSettings.token}/${encodeURI(title)}/${encodeURI(message)}`);
    logger.info('消息提醒发送成功');
  } catch (e) {
    logger.error('消息提醒发送失败');
    logger.error(e.message);
  }
};

const findTodayRecord = (db) => {
  return db.get('tasks')
    .find({
      today: formatTime()
    }).value();
};

module.exports = {
  formatTime,
  sendMessage,
  findTodayRecord
};