import BaseEntity from './baseEntity';
import WOLF from '../client/WOLF';

export class Ad extends BaseEntity {
  start: number;
  end: number;

  ad: string;
  channelName: string;

  constructor (client: WOLF, data: RegExpMatchArray) {
    super(client);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.start = data.index!;
    this.end = this.start + data[0].length;
    this.ad = data[0];
    this.channelName = data[2].trim();
  }

  async channel () {
    return this.client.channel.getByName(this.channelName);
  }
}

export default Ad;
