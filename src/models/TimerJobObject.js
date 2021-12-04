
class TimerJobObject {
  constructor (data) {
    this.handler = data.name || undefined;
    this.data = data.data || undefined;
    this.delay = data.delay || undefined;
    this.timestamp = data.timestamp || undefined;
    this.id = data.id || undefined;
    this.remaining = data.remaining || undefined;
  }
}

module.exports = TimerJobObject;
