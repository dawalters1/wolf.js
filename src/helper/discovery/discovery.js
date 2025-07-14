
// TODO: determine the layout of this
class DiscoveryHelper {
  constructor (client) {
    this.client = client;
  }

  async get (languageId, opts) {
    return this.client.topic.getTopic('discover', languageId, opts);
  }
}

export default DiscoveryHelper;
