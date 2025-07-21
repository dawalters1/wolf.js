import moment from 'moment';
import NumberUtility from './number.js';
import StringUtility from './string.js';
import TimerUtility from './timer.js';

class Utility {
  constructor (client) {
    this.client = client;

    this.string = new StringUtility();
    this.number = new NumberUtility();
    this.timer = new TimerUtility(client);
  }

  async delay (time, type = 'milliseconds') {
    return new Promise((resolve) =>
      setTimeout(resolve, type === 'seconds'
        ? time * 1000
        : time)
    );
  }

  toReadableTime (time, language, type = 'milliseconds') {
    const info = moment.duration(time, type)._data;
    const parts = [];

    const timeUnits = [
      ['years', `${this.client.config.keyword}_time_type_years`],
      ['months', `${this.client.config.keyword}_time_type_months`],
      ['weeks', `${this.client.config.keyword}_time_type_weeks`],
      ['days', `${this.client.config.keyword}_time_type_days`],
      ['hours', `${this.client.config.keyword}_time_type_hours`],
      ['minutes', `${this.client.config.keyword}_time_type_minutes`]
    ];

    for (const [unit, phraseKey] of timeUnits) {
      if (info[unit] > 0) {
        parts.push(`${info[unit]}${this.client.phrase.getByLanguageAndName(language, phraseKey)}`);
      }
    }

    if ((!info.seconds && parts.length === 0) || info.seconds > 0) {
      parts.push(`${info.seconds}${this.client.phrase.getByLanguageAndName(language, `${this.client.config.keyword}_time_type_seconds`)}`);
    }

    return parts.join(' ');
  }
}

export default Utility;
