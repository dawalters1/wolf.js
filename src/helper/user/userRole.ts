import { Command } from '../../constants/Command';
import UserRole, { ServerUserRole } from '../../structures/userRole';
import WOLF from '../../client/WOLF';

class UserRoleHelper {
  readonly client: WOLF;
  constructor (client: WOLF) {
    this.client = client;
  }

  async getById (userId: number): Promise<(UserRole | null)[]> {
    const response = await this.client.websocket.emit<ServerUserRole[]>(
      Command.SUBSCRIBER_ROLE_SUMMARY,
      {
        body: {
          subscriberId: userId
        }
      }
    );

    return response.body.map((serverUserRole) => new UserRole(this.client, serverUserRole));
  }
}

export default UserRoleHelper;
