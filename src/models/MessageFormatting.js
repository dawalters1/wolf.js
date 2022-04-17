const Base = require('./Base');
const MessageFormattingAd = require('./MessageFormattingAd');
const MessageFormattingUrl = require('./MessageFormattingUrl');

class MessageFormatting extends Base {
  constructor (api, data) {
    super(api);

    this.groupLinks = data.groupLinks ? data.groupLinks.map((groupLink) => new MessageFormattingAd(api, groupLink)) : undefined;
    this.links = data.links ? data.links.map((link) => new MessageFormattingUrl(api, link)) : undefined;
  }
}

module.exports = MessageFormatting;
