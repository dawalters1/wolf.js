'use strict';

// Node dependencies

// 3rd Party Dependencies
import { StatusCodes } from 'http-status-codes';
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import ChannelCache from '../../cache/ChannelCache.js';
import structures from '../../structures/index.js';
// Variables
import { ChannelEntities, Command, Language } from '../../constants/index.js';

class Channel extends Base {
  constructor (client) {
    super(client);

    this.cache = new ChannelCache();
    this.cache.fetched = false;
  }
}

export default Channel;
