import UserCache from '../../cache/UserCache.js';
import Base from '../Base.js';
import Followers from './Followers.js';
import Presence from './Presence.js';
import WOLFStar from './WOLFStar.js';

class User extends Base {
  constructor (client) {
    super(client);

    this.userCache = new UserCache();

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
      : userIds.map((id) => this.userCache.get(id))
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
      achievements.push(
        subResponse.success
          ? this.cache.set(languageId, new structures.Achievement(this.client, subResponse.body))
          : new structures.Achievement(this.client, { id: idList[index] })
      )
    );

    // Sort to match ids order
    return userIds
      .map((id) =>
        achievements.find((achievement) => achievement.id === id)
      );
  }

  async search (query) {

  }

  async getChatHistory () {

  }
}

export default User;
