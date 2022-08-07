import Base from './Base.js';
class GroupMember extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.hash = data?.hash;
    this.capabilities = data?.capabilities;
  }
}
export default GroupMember;
