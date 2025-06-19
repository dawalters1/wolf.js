import BaseEntity from './baseEntity';
import WOLF from '../client/WOLF';

export class Link extends BaseEntity {
  start: number;
  end: number;
  link: string;

  constructor (client: WOLF, data: RegExpMatchArray) {
    super(client);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.start = data.index!;
    this.end = this.start + data[0].length;
    this.link = data[0];
  }
}

export default Link;
