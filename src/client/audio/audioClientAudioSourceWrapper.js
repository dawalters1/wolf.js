import wrtc from '@roamhq/wrtc';

const { nonstandard } = wrtc;

const SAMPLE_RATE = 48000;
const SLICE_COUNT = 1920;
const CHANNEL_COUNT = 2;
const BITRATE = 16;
const FRAMES = 480;

export class AudioClientAudioSourceWrapper {
  constructor () {
    this.audioSource = new nonstandard.RTCAudioSource();
    this.leftoverSamples = new Int32Array(FRAMES);
    this.numLeftoverSamples = 0;
    this.volume = 1;
  }

  onData (buffer) {
    if (!(buffer.buffer instanceof ArrayBuffer)) {
      throw new Error('Expected an ArrayBuffer');
    }

    const samples = new Int32Array(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength / Int32Array.BYTES_PER_ELEMENT
    );

    let chunkStart = 0;

    while (chunkStart < samples.length) {
      const wantedNumberOfSamples =
        FRAMES - this.numLeftoverSamples;

      const remainingSamples = samples.length - chunkStart;

      if (remainingSamples < wantedNumberOfSamples) {
        this.leftoverSamples.set(samples.slice(chunkStart));
        this.numLeftoverSamples = remainingSamples;
        break;
      }

      let chunk = samples.slice(chunkStart, chunkStart + wantedNumberOfSamples);

      if (this.numLeftoverSamples) {
        this.leftoverSamples.set(chunk, this.numLeftoverSamples);
        chunk = this.leftoverSamples;
        this.numLeftoverSamples = 0;
      }

      this.audioSource.onData({
        samples: chunk.map((samples) => this.volume === 1 ? samples : samples * this.volume),
        sampleRate: SAMPLE_RATE,
        bitsPerSample: BITRATE,
        channelCount: CHANNEL_COUNT,
        numberOfFrames: FRAMES
      });

      chunkStart += wantedNumberOfSamples;
    }
  }

  createTrack () {
    return this.audioSource.createTrack();
  }
}

export default AudioClientAudioSourceWrapper;
