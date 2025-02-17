'use strict';

// Node dependencies

// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import structures from '../../structures/index.js';
// Variables
import { Command, Language } from '../../constants/index.js';

class ChannelMember extends Base {
  constructor (client) {
    super(client);

    // TODO: figure out how i can cache this
    this.cache = new Cache();
  }
}

export default ChannelMember;
