
/**
 * Get the item at an index in the Set
 * @param {Number} index
 * @returns Specified index
 */
// eslint-disable-next-line no-extend-native
Set.prototype.get = function (index) {
  if (typeof index !== 'number' || index < 0) { return undefined; }
  let i = 0;
  for (const item of this) {
    if (i === index) { return item; }
    i++;
  }
  return undefined; // index out of range
};

import {
  AdminAction,
  Avatar,
  ChannelAudioSlotConnectionState,
  ChannelEventType,
  ChannelMemberCapability,
  ChannelMemberListType,
  ChannelVerificationTier,
  ContextType,
  DeviceType,
  EmbedType,
  Gender,
  IconSize,
  Language,
  LookingFor,
  MessageFilterTierLevel,
  MessageType,
  Relationship,
  Search,
  TipDirection,
  TipPeriod,
  TipType,
  TopicPageRecipeType,
  UserFollowerType,
  OnlineState,
  UserPrivilege,
  WOLFStarTalent
} from './src/constants/index.js';

import Command from './src/commands/Command.js';
import CommandManager from './src/commands/CommandManager.js';
import WOLF from './src/client/WOLF.js';
import WOLFResponse from './src/entities/WOLFResponse.js';

process.on('unhandledRejection', (error) => {
  if (error instanceof WOLFResponse) { return; }
  console.error(error);
});

const api = {
  WOLF,
  Command,
  CommandManager,
  AdminAction,
  Avatar,
  ChannelAudioSlotConnectionState,
  ChannelEventType,
  ChannelMemberCapability,
  ChannelMemberListType,
  ChannelVerificationTier,
  ContextType,
  DeviceType,
  EmbedType,
  Gender,
  IconSize,
  Language,
  LookingFor,
  MessageFilterTierLevel,
  MessageType,
  Relationship,
  Search,
  TipDirection,
  TipPeriod,
  TipType,
  TopicPageRecipeType,
  UserFollowerType,
  OnlineState,
  UserPrivilege,
  WOLFStarTalent,
  WOLFResponse
};

export default api;

export {
  WOLF,
  Command,
  CommandManager,
  AdminAction,
  Avatar,
  ChannelAudioSlotConnectionState,
  ChannelEventType,
  ChannelMemberCapability,
  ChannelMemberListType,
  ChannelVerificationTier,
  ContextType,
  DeviceType,
  EmbedType,
  Gender,
  IconSize,
  Language,
  LookingFor,
  MessageFilterTierLevel,
  MessageType,
  Relationship,
  Search,
  TipDirection,
  TipPeriod,
  TipType,
  TopicPageRecipeType,
  UserFollowerType,
  OnlineState,
  UserPrivilege,
  WOLFStarTalent,
  WOLFResponse
};
