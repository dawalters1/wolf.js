// TODO: VALIDATION

const { Command, Language, Category } = require('../../constants');

class GroupProfile {
  constructor (client, groupData) {
    this.client = client;

    this.id = groupData?.id;
    this.name = groupData?.name ?? undefined;
    this.tagLine = groupData?.description ?? undefined;
    this.description = groupData?.extended.longDescription ?? undefined;
    this.peekable = groupData?.extended.peekable ?? false;
    this.discoverable = groupData?.extended.discoverable ?? false;
    this.advancedAdmin = groupData?.extended.advancedAdmin ?? false;
    this.entryLevel = groupData?.extended.entryLevel ?? 0;
    this.language = groupData?.extended.language ?? Language.NOT_SPECIFIED;
    this.category = groupData?.extended.category ?? Category.NOT_SPECIFIED;

    this.audioConfig = groupData?.audioConfig ?? {
      minRepLevel: 0,
      enabled: false,
      stageId: null
    };

    this.messageConfig = groupData?.messageConfig ?? {
      disableImage: false,
      disableImageFilter: true,
      disableVoice: false,
      disableHyperlink: false,
      slowModeRateInSeconds: 0
    };

    this.avatar = undefined;

    this.isNew = groupData;
  }

  setName (name) {
    this.name = name;

    return this;
  }

  setDescription (description) {
    this.description = description;

    return this;
  }

  setCategory (category) {
    this.category = category;

    return this;
  }

  setLanguage (language) {
    this.language = language;

    return this;
  }

  setEntryLevel (level) {
    this.entryLevel = level;

    return this;
  }

  setAvatar (avatar) {
    this.avatar = avatar;

    return this;
  }

  setDiscoverable (isDiscoverable) {
    this.discoverable = isDiscoverable;

    return this;
  }

  setPeekable (isPeekable) {
    this.peekable = isPeekable;

    return this;
  }

  setStageSettings (stageSettings) {
    this.audioConfig.stageId = stageSettings?.stageId || this.audioConfig.stageId;
    this.audioConfig.minRepLevel = stageSettings?.minRepLevel || this.audioConfig.minRepLevel;

    return this;
  }

  setMessageSettings (messageSettings) {
    this.messageConfig.disableImage = messageSettings?.disableImage || this.messageConfig.disableImage;
    this.messageConfig.disableImageFilter = messageSettings?.disableImageFilter || this.messageConfig.disableImageFilter;
    this.messageConfig.disableVoice = messageSettings?.disableVoice || this.messageConfig.disableVoice;
    this.messageConfig.disableHyperlink = messageSettings?.disableHyperlink || this.messageConfig.disableHyperlink;
    this.messageConfig.slowModeRateInSeconds = messageSettings?.slowModeRateInSeconds || this.messageConfig.slowModeRateInSeconds;

    return this;
  }

  save () {
    return Promise.resolve((resolve) => {
      const response = this.client.emit(
        this.isNew ? Command.GROUP_CREATE : Command.GROUP_PROFILE_UPDATE,
        {
          id: this.id,
          name: this.name,
          description: this.description,
          peekable: this.peekable,
          extended:
          {
            language: this.language,
            advancedAdmin: this.advancedAdmin,
            longDescription: this.description,
            category: this.category,
            entryLevel: this.entryLevel,
            discoverable: this.discoverable
          },
          messageConfig: this.messageConfig
        }
      );

      if (response.success) {
        if (this.avatar) {
        // TODO: upload thumbnail
        }

        this.audioConfig.id = response.body.id;

        this.client.websocket.emit(
          Command.GROUP_AUDIO_UPDATE,
          this.audioConfig
        );
      }

      resolve(response);
    });
  }
}

module.exports = GroupProfile;
