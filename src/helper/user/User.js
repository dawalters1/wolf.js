import UserCache from '../../cache/UserCache.js';
import DataManager from '../../managers/DataManager.js';
import Base from '../Base.js';
import Followers from './Followers.js';
import Presence from './Presence.js';
import WOLFStar from './WOLFStar.js';
import structures from '../../structures/index.js';

class User extends Base {
  constructor (client) {
    super(client);

    this._users = new DataManager();

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

  async getByIds (userIds, subscribe = true, forceNew = false) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    {

    }

    const users = forceNew
      ? []
      : userIds.map((id) => this._users.get(id))
        .filter(Boolean);

    if (users.length === userIds.length) { return users; }

    const idList = userIds.filter((id) => !users.some((user) => user.id === id));

    const response = await this.client.emit(
      Command.SUBSCRIBER_PROFILE,
      {
        headers: {
          version: 4
        },
        body: {
          idList,
          subscribe,
          extended: true
        }
      }
    );

    response.body.forEach((subResponse, index) =>
      users.push(
        subResponse.success
          ? this.cache._add(new structures.User(this.client, subResponse.body))
          : new structures.User(this.client, { id: idList[index] })
      )
    );

    // Sort to match ids order
    return userIds
      .map((id) =>
        users.find((user) => user.id === id)
      );
  }

  async search (query) {

  }

  async getChatHistory () {

  }
}

export default User;
