import Base from '../Base.js';
import Followers from './Followers.js';
import Presence from './Presence.js';
import WOLFStar from './WOLFStar.js';

class User extends Base {
  constructor (client) {
    super(client);

    this.cache = new UserCache();

    this.followers = new Followers(client);
    this.presence = new Presence(client);
    this.wolfstar = new WOLFStar(client);
  }

  async getById (id, subscribe = true, forceNew = false) {
    id = Number(id) || id;

    {
      // TODO validation
    }

    return (await this.getByIds([id], subscribe, forceNew))[0];
  }

  async getByIds (ids, subscribe = true, forceNew = false) {
    ids = ids.map((id) => Number(id) || id);

    {

    }

    const users = forceNew ? [] : this.cache.get(ids);

    if (users.length === ids.length) {
      return users;
    }

    const userIds = users.map((user) => user.id);
    const missingUserIds = ids.filter((id) => !userIds.includes(id));

    const response = await this.client.emit(
      Command.SUBSCRIBER_PROFILE,
      {
        headers: {

        },
        body: {
          idList: missingUserIds,
          subscribe
        }
      }
    );
  }

  async search (query) {

  }

  async getChatHistory () {

  }
}

export default User;
