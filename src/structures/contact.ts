import BaseEntity from './baseEntity.ts';
import ContactAdditionalInfo, { ServerContactAdditionalInfo } from './contactAdditionalInfo.ts';
import { key } from '../decorators/key.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerContact {
  id: number;
  additionalInfo: ServerContactAdditionalInfo
}

export class Contact extends BaseEntity {
  @key
    id: number;

  additionalInfo: ContactAdditionalInfo;

  constructor (client: WOLF, data: ServerContact) {
    super(client);
    this.id = data.id;
    this.additionalInfo = new ContactAdditionalInfo(client, data.additionalInfo);
  }
}
export default Contact;
