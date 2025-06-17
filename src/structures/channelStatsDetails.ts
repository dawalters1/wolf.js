import BaseEntity from './baseEntity';
import ChannelStatsOwner, { ServerGroupStatsOwner } from './channelStatsOwner';
import WOLF from '../client/WOLF';

export type ServerGroupStatsDetails = {
  id?: number;
  actionCount: number;
  emoticonCount: number;
  groupId: number;
  happyEmoticonCount: number;
  imageCount: number;
  lineCount: number;
  memberCount?: number;
  name?: string;
  owner?: ServerGroupStatsOwner;
  message: string | null;
  nickname: string;
  packCount: number;
  questionCount: number;
  randomQuote: string;
  sadEmoticonCount: number;
  subId: number;
  swearCount: number;
  textCount: number;
  voiceCount: number;
  wordCount: number;
  timestamp?: number;
}

export class ChannelStatsDetails extends BaseEntity {
  id?: number;
  actionCount: number;
  emoticonCount: number;
  channelId: number;
  happyEmoticonCount: number;
  imageCount: number;
  lineCount: number;
  memberCount?: number;
  name?: string;
  owner?: ChannelStatsOwner;
  message: string | null;
  nickname: string;
  packCount: number;
  questionCount: number;
  randomQuote?: string;
  sadEmoticonCount: number;
  userId: number;
  swearCount: number;
  textCount: number;
  voiceCount: number;
  wordCount: number;
  timestamp?: number;

  constructor (client: WOLF, data: ServerGroupStatsDetails) {
    super(client);

    this.id = data.id;
    this.actionCount = data.actionCount;
    this.emoticonCount = data.emoticonCount;
    this.channelId = data.groupId;
    this.happyEmoticonCount = data.happyEmoticonCount;
    this.imageCount = data.imageCount;
    this.lineCount = data.lineCount;
    this.memberCount = data.memberCount;
    this.name = data.name;
    this.owner = data.owner
      ? new ChannelStatsOwner(this.client, data.owner)
      : undefined;
    this.message = data.message;
    this.nickname = data.nickname;
    this.packCount = data.packCount;
    this.questionCount = data.questionCount;
    this.randomQuote = data.randomQuote;
    this.sadEmoticonCount = data.sadEmoticonCount;
    this.userId = data.subId;
    this.swearCount = data.swearCount;
    this.textCount = data.textCount;
    this.voiceCount = data.voiceCount;
    this.wordCount = data.wordCount;
  }
}

export default ChannelStatsDetails;
