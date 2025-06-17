import BaseEntity from './baseEntity';
import WOLF from '../client/WOLF';

export type ServerGroupStatsTrend = {
    day?: number;
    hour?: number;
    lineCount: number
}

export class ChannelStatsTrend extends BaseEntity {
  day?: number;
  hour?: number;
  lineCount: number;

  constructor (client:WOLF, data: ServerGroupStatsTrend) {
    super(client);

    this.day = data.day;
    this.hour = data.hour;
    this.lineCount = data.lineCount;
  }
}

export default ChannelStatsTrend;
