const { capability, adminAction } = require('@dawalters1/constants');

const toCapabilityFromAction = (type) => {
  switch (type) {
    case adminAction.OWNER:
      return capability.OWNER;
    case adminAction.ADMIN:
      return capability.ADMIN;
    case adminAction.MOD:
      return capability.MOD;
    case adminAction.REGULAR:
      return capability.REGULAR;
    case adminAction.KICK:
      return capability.NOT_MEMBER;
    case adminAction.BAN:
      return capability.BANNED;
  }
};

const toCapabilityFromString = (type) => {
  switch (type.toLowerCase()) {
    case 'owner':
      return capability.OWNER;
    case 'admin':
      return capability.ADMIN;
    case 'mod':
      return capability.MOD;
    case 'reset':
      return capability.REGULAR;
    case 'kick':
      return capability.NOT_MEMBER;
    case 'ban':
      return capability.BANNED;
  }
};

module.exports = (type) => {
  if (parseInt(type)) {
    return toCapabilityFromAction(type);
  }

  return toCapabilityFromString(type);
};
