import { Base } from './Base.js';

class MessageMetadataFormattingGroupLink extends Base {
  constructor (client, data) {
    super(client);
    this.start = data?.start;
    this.end = data?.end;
    this.groupId = data?.groupId;
  }
}

export { MessageMetadataFormattingGroupLink };
