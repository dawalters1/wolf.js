import { Command } from '../../constants/Command';
import UserRole from '../../structures/userRole';
import WOLF from '../../client/WOLF';

class UserRoleHelper {
  client: Readonly<WOLF>;
  constructor (client: WOLF) {
    this.client = client;
  }

  async getById (userId: number): Promise<(UserRole | null)[]> {
    const response = await this.client.websocket.emit<UserRole[]>(
      Command.SUBSCRIBER_ROLE_SUMMARY,
      {
        body: {
          subscriberId: userId
        }
      }
    );

    return response.body;
  }
}

export default UserRoleHelper;
