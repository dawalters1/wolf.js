const { adminAction } = require('@dawalters1/constants');

module.exports = (type) => {
  switch (type.toLowerCase()) {
    case 'owner':
      return adminAction.OWNER;
    case 'admin':
      return adminAction.ADMIN;
    case 'mod':
      return adminAction.MOD;
    case 'reset':
      return adminAction.REGULAR;
    case 'kick':
      return adminAction.KICK;
    case 'ban':
      return adminAction.BAN;
    case 'leave':
      return adminAction.LEAVE;
    case 'join':
      return adminAction.REGULAR;
  }
};
