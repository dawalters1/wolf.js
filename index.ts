import 'reflect-metadata';
import WOLF from './src/client/WOLF.ts';
import Channel, { ServerChannel } from './src/structures/channel.ts';

const wolf = new WOLF();

const test = {
  id: 5,
  name: 'Test',
  hash: 'asdfd',
  owner: {
    id: 1,
    hash: 'fda'
  },
  icon: 1,
  iconHash: 'fda',
  iconInfo: {
    availableSizes: {},
    availableTypes: []
  },
  reputation: 12.32,
  members: 3,
  premium: false,
  official: false,
  peekable: false,
  verificationTier: 'none'

} as unknown as ServerChannel;

wolf.channel.cache?.set(new Channel(wolf, test as ServerChannel));

console.log(wolf.channel.getById(1, { forceNew: false }));
