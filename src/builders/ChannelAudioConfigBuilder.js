
class ChannelAudioConfigBuilder {
  constructor (builder) {
    this.builder = builder;
  }

  setEnabled (enabled) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.audioConfig.enabled = enabled;

    return this;
  }

  setStageId (stageId) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.audioConfig.stageId = stageId;

    return this;
  }

  setMinRepLevel (minRepLevel) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.audioConfig.minRepLevel = minRepLevel;

    return this;
  }

  exit () {
    return this.builder;
  }
}

export default ChannelAudioConfigBuilder;
