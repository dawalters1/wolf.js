
const Base = require('./Base');
const MessageFormatting = require('./MessageFormatting');

class MessageMetadata extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);

    this.formatting = data.formatting ? new MessageFormatting(data.formatting) : null;
  }
}

module.exports = MessageMetadata;
