const EventEmitter = require('events').EventEmitter;

/**
 * Terrible solution to a trash problem :)
 */
module.exports = class Limiter extends EventEmitter {
  constructor (stream, chunkSize) {
    super();
    this._stream = stream;
    this._chunkSize = chunkSize;

    this._endOfStream = false;

    this._disposed = false;
    this._paused = false;
    this._samples = new Uint8Array(0);

    this._stream
      .on('data', (buffer) => {
        const newSamples = new Int8Array(buffer);
        const mergedSamples = new Int8Array(this._samples.length + newSamples.length);
        mergedSamples.set(this._samples);
        mergedSamples.set(newSamples, this._samples.length);
        this._samples = mergedSamples;
      })
      .on('finish', () => {
        this._endOfStream = true;
      });

    const sendData = async () => {
      if (this._samples.length > this._chunkSize * 2) {
        const sample = this._samples.slice(0, this._chunkSize * 2);
        this._samples = this._samples.slice(this._chunkSize * 2);

        this.emit('data', sample);
      }

      if (this._endOfStream) {
        this.emit('end');
      }
    };

    const paused = () => this._paused;
    const disposed = () => this._disposed;
    (async function repeat () {
      if (disposed()) {
        return;
      }

      if (!paused()) {
        await sendData();
      }

      setTimeout(repeat, 18);
    })();
  }

  pause () {
    this._paused = true;

    this.emit('paused');
  }

  resume () {
    this._paused = false;

    this.emit('resumed');
  }

  destory () {
    this._stream.close();

    this.dispose();
  }
};
