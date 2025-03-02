import ChannelAudioConfigBuilder from './ChannelAudioConfigBuilder';
import ChannelExtendedBuilder from './ChannelExtendedBuilder';
import ChannelMessageConfigBuilder from './ChannelMessageConfigBuilder';

class ChannelBuilder {
  constructor (channel) {
    this.id = channel?.id;
    this.name = channel?.name;
    this.description = channel?.description;
    this.peekable = channel?.peekable ?? false;
    this.extended = {
      discoverable: channel?.extended?.discoverable ?? true,
      advancedAdmin: channel?.extended?.advancedAdmin ?? false,
      entryLevel: channel?.extended?.entryLevel ?? 0,
      language: channel?.extended?.language,
      longDescription: channel?.extended?.longDescription,
      category: channel?.extended?.category
    };
    this.audioConfig = {
      enabled: channel?.audioConfig?.enabled ?? false,
      stageId: channel?.audioConfig?.stageId ?? 1,
      minRepLevel: channel?.audioConfig?.minRepLevel ?? 0
    };
    this.messageConfig = {
      disableImage: channel?.messageConfig?.disableImage ?? false,
      disableImageFilter: channel?.messageConfig?.disableImageFilter ?? false,
      disableVoice: channel?.messageConfig?.disableVoice ?? false,
      disableHyperlink: channel?.messageConfig?.disableHyperlink ?? false,
      slowModeRateInSeconds: channel?.messageConfig?.slowModeRateInSeconds ?? false
    };
  }

  extended () {
    return new ChannelExtendedBuilder(this);
  }

  audioConfig () {
    return new ChannelAudioConfigBuilder(this);
  }

  messageConfig () {
    return new ChannelMessageConfigBuilder(this);
  }

  setName (name) {
    { // eslint-disable-line no-lone-blocks

    }

    this.name = name;

    return this;
  }

  setPeekable (peekable) {
    { // eslint-disable-line no-lone-blocks

    }

    this.peekable = peekable;

    return this;
  }

  setDescription (description) {
    { // eslint-disable-line no-lone-blocks

    }

    this.description = description;

    return this;
  }
}

export default ChannelBuilder;
