
class TimerJobObject {
  constructor (data) {
    this.handler = data.name;
    this.data = data.data;
    this.delay = data.delay;
    this.timestamp = data.timestamp;
    this.id = data.id;
    this.remaining = data.remaining;
  }
}

module.exports = TimerJobObject;
