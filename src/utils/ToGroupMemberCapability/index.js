const { capability, adminAction } = require('@dawalters1/constants');

module.exports = (type) => {
  switch (type) {
    case adminAction.OWNER:
      return capability.OWNER;
    case adminAction.ADMIN:
      return capability.ADMIN;
    case adminAction.MOD:
      return capability.MOD;
    case adminAction.REGULAR:
      return capability.REGULAR;
    case adminAction.SILENCE:
      return capability.SILENCED;
    case adminAction.KICK:
      return capability.NOT_MEMBER;
    case adminAction.BAN:
      return capability.BANNED;
    case adminAction.LEAVE:
      return capability.NOT_MEMBER;
  }
};
