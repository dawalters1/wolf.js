const { Capability, AdminAction } = require('../../constants');

module.exports = (type) => {
  switch (type) {
    case AdminAction.OWNER:
      return Capability.OWNER;
    case AdminAction.ADMIN:
      return Capability.ADMIN;
    case AdminAction.MOD:
      return Capability.MOD;
    case AdminAction.REGULAR:
      return Capability.REGULAR;
    case AdminAction.SILENCE:
      return Capability.SILENCED;
    case AdminAction.KICK:
      return Capability.NOT_MEMBER;
    case AdminAction.BAN:
      return Capability.BANNED;
    case AdminAction.LEAVE:
      return Capability.NOT_MEMBER;
  }
};
