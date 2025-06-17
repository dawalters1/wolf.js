import BaseEntity from './baseEntity';
import WOLF from '../client/WOLF';

export type ServerGroupStatsTop = {
  nickname: string;
  randomQuote?: string;
  subId: number;
  wpl?: number;
  value: number;
  percentage: number;
}

export class ChannelStatsTop extends BaseEntity {
  nickname: string;
  randomQuote?: string;
  userId: number;
  wordsPerLine?: number;
  value: number;
  percentage: number;

  constructor (client:WOLF, data: ServerGroupStatsTop) {
    super(client);

    this.nickname = data.nickname;
    this.randomQuote = data.randomQuote;
    this.userId = data.subId;
    this.wordsPerLine = data.wpl;
    this.value = data.value;
    this.percentage = data.percentage;
  }
}

export default ChannelStatsTop;
