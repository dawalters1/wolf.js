
class ChannelMessageConfigBuilder {
  constructor (builder) {
    this.builder = builder;
  }

  setDisableImage (state) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.messageConfig.disableImage = state;

    return this;
  }

  setDisableImageFilter (state) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.messageConfig.disableImageFilter = state;

    return this;
  }

  setDisableVoice (state) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.messageConfig.disableVoice = state;

    return this;
  }

  setDisableHyperlink (state) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.messageConfig.disableHyperlink = state;

    return this;
  }

  setSlowModeRateInSeconds (slowModeRateInSeconds) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.messageConfig.slowModeRateInSeconds = slowModeRateInSeconds;

    return this;
  }

  exit () {
    return this.builder;
  }
}

export default ChannelMessageConfigBuilder;
