
export const AdminAction = {
  /**
   * User has no power in the channel
   */
  REGULAR: 0,
  /**
   * User has admin capabilities
   */
  ADMIN: 1,
  /**
   * User has mod capabilites
   */
  MOD: 2,
  /**
   * User is banned in the channel
   */
  BAN: 4,
  /**
   * User is silenced
   */
  SILENCE: 8,
  /**
   * User will be removed from the channel
   */
  KICK: 16,
  /**
   * User joined the channel
   */
  JOIN: 17,
  /**
   * User left the channel
   */
  LEAVE: 18,
  /**
   * User has owner capabilties
   */
  OWNER: 32,
  /**
   * User has co-owner capabilities
   */
  COOWNER: 64
};

export default AdminAction;
