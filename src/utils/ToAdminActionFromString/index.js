const { AdminAction } = require('../../constants');

module.exports = (type) => {
  switch (type.toLowerCase()) {
    case 'owner':
      return AdminAction.OWNER;
    case 'admin':
      return AdminAction.ADMIN;
    case 'mod':
      return AdminAction.MOD;
    case 'reset':
      return AdminAction.REGULAR;
    case 'kick':
      return AdminAction.KICK;
    case 'silence':
      return AdminAction.SILENCE;
    case 'ban':
      return AdminAction.BAN;
    case 'leave':
      return AdminAction.LEAVE;
    case 'join':
      return AdminAction.REGULAR;
  }
};
