const schedule = require('node-schedule');
const { sendMessage, findTodayRecord, formatTime } = require('./utils');
const { logger } = require('./create_logger');

/**
 * 创建任务
 * @param {Object} db 文件数据库handler
 * @param {String} hour 几时
 * @param {String} minute 几分
 * @param {Array<number>} dayOfWeek 一周哪几天
 * @returns 
 */
const createSchedule = function (db, hour, minute, dayOfWeek) {
  const rule = new schedule.RecurrenceRule();

  if (dayOfWeek) {
    rule.dayOfWeek = dayOfWeek;
  }
  rule.hour = hour;
  rule.minute = minute;

  return schedule.scheduleJob(rule, function () {
    logger.info('开始提醒...');

    sendMessage();

    const hasTodayRecord = findTodayRecord(db);
    if (!hasTodayRecord) {
      db.get('tasks')
        .push({
          today: formatTime(),
          confirm: false,
          next: ''
        })
        .write();
    } else {
      db.get('tasks').find({
        today: formatTime()
      }).assign({
        next: ''
      }).write();
    }

    // 未确认则每一分钟提醒一次
    const quickConfirmJob = schedule.scheduleJob('*/1 * * * *', function () {
      const find = db.get('tasks').find({
        today: formatTime()
      }).value();

      if (find && (find.confirm || find.next)) {
        quickConfirmJob.cancel();
        return;
      }

      logger.info('每分钟提醒一次');

      sendMessage();
    });
  });
};

module.exports = {
  createSchedule
};