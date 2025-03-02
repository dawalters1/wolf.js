
class ChannelExtendedBuilder {
  constructor (builder) {
    this.builder = builder;
  }

  setDiscoverable (discoverable) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.extended.discoverable = discoverable;

    return this;
  }

  setEntryLevel (entryLevel) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.extended.entryLevel = entryLevel;

    return this;
  }

  setPassword (password) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.extended.password = password;

    return this;
  }

  setLanguage (language) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.extended.language = language;

    return this;
  }

  setCategory (category) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.extended.category = category;

    return this;
  }

  setLongDescription (longDescription) {
    { // eslint-disable-line no-lone-blocks

    }

    this.builder.extended.longDescription = longDescription;

    return this;
  }

  exit () {
    return this.builder;
  }
}

export default ChannelExtendedBuilder;
