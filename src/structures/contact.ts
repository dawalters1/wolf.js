import BaseEntity from './baseEntity.ts';
import ContactAdditionalInfo, { ServerContactAdditionalInfo } from './contactAdditionalInfo.ts';
import { key } from '../decorators/key.ts';
import { User } from './user';
import WOLF from '../client/WOLF.ts';

export interface ServerContact {
  id: number;
  additionalInfo: ServerContactAdditionalInfo
}

export class Contact extends BaseEntity {
  @key
    id: number;

  additionalInfo: ContactAdditionalInfo;

  constructor (client: WOLF, data: ServerContact | User) {
    super(client);

    this.id = data.id;
    const additionalInfo = 'additionalInfo' in data ? data.additionalInfo : data;
    this.additionalInfo = new ContactAdditionalInfo(client, additionalInfo);
  }

  patch (entity: any): this {
    return this;
  }
}
export default Contact;
