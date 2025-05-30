import BaseHelper from '../baseHelper.ts';
import { ServerUser, User } from '../../structures/user.ts';

export class UserHelper extends BaseHelper<User> {
  async getById (id: number) {
    // TODO get from cache or retrieve user
    return new User(this.client, {} as ServerUser);
  }

  async getAllById (ids: number[]) {
    // TODO get from cache or retrieve users
    return [new User(this.client, {} as ServerUser)];
  }
}
