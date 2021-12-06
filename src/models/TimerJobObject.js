
class TimerJobObject {
  constructor (data) {
    this.handler = data && data.name ? data.name : undefined;
    this.data = data && data.data ? data.data : undefined;
    this.delay = data && data.delay ? data.delay : undefined;
    this.timestamp = data && data.timestamp ? data.timestamp : undefined;
    this.id = data && data.id ? data.id : undefined;
    this.remaining = data && data.remaining ? data.remaining : undefined;
  }
}

module.exports = TimerJobObject;
