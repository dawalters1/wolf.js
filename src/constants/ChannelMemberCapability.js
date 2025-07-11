
export const ChannelMemberCapability = {
  /**
   * User is not a member
   */
  NONE: -1,
  /**
   * User is a regular member
   */
  REGULAR: 0,
  /**
   * User is an admin
   */
  ADMIN: 1,
  /**
   * User is a mod
   */
  MOD: 2,
  /**
   * User is banned
   */
  BANNED: 4,
  /**
   * User is silenced
   */
  SILENCED: 8,
  /**
   * User is owner
   */
  OWNER: 32,
  /**
   * User is co-owner
   */
  CO_OWNER: 64
};

export default ChannelMemberCapability;
