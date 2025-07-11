
export const UserPrivilege = {
  SUBSCRIBER: 1, // 1
  /**
   * User tests bots
   */
  BOT_TESTER: 2, // 1 << 1
  /** @deprecated */
  HOST: 4, // 1 << 2
  /**
   * User submits content to bots
   */
  CONTENT_SUBMITER: 8, // 1 << 3
  /**
   *
   */
  SELECT_CLUB_1: 16, // 1 << 4
  /**
   * User has access to admin panel
   */
  ADMIN_AREA: 32, // 1 << 5
  /**
   * User is top 3 levels
   */
  ELITE_CLUB_1: 64, // 1 << 6
  /**
   * User is Top level
   */
  NUMBER_ONE_USER: 128, // 1 << 7

  WELCOME_HOST: 256, // 1 << 8
  /**
   * User is a volunteer
   */
  VOLUNTEER: 512, // 1 << 9
  /**
   *
   */
  SELECT_CLUB_2: 1024, // 1 << 10
  /**
   * User tests clients
   */
  ALPHA_TESTER: 2048, // 1 << 11
  /**
   * User is a staff member
   */
  STAFF: 4096, // 1 << 12
  /** @deprecated */
  DJ: 8192, // 1 << 13
  /**
   * User is a developer
   */
  DEVELOPER: 16384, // 1 << 14
  /**
   * User has ability to change privileges
   */
  PRIVILEGE_ADMIN: 32768, // 1 << 15
  /**
   * User has a charm active
   */
  CHARM_ACTIVE: 65536, // 1 << 16
  /**
   *
   */
  ELITE_CLUB_2: 131072, // 1 << 17
  /**
   *
   */
  CONTENT_CREATOR: 262144, // 1 << 18
  /**
   * User has validated their email
   */
  VALID_EMAIL: 524288, // 1 << 19
  /**
   * User has a premium account
   */
  PREMIUM_ACCOUNT: 1048576, // 1 << 20
  /**
   * User is a wolfstar
   */
  WOLFSTAR: 2097152, // 1 << 21
  /**
   * User is
   */
  ELITE_CLUB_3: 4194304, // 1 << 22
  /**
   * User is a wolfstar pro
   */
  WOLFSTAR_PRO: 8388608, // 1 << 23
  /**
   *
   */
  USER_ADMIN: 16777216, // 1 << 24
  /**
   * User has group admin privileges (I.E can admin, mod themselves/others)
   */
  GROUP_ADMIN: 33554432, // 1 << 25
  /**
   * User is a bot
   */
  BOT: 67108864, // 1 << 26
  /**
   * Is this even used?
   */
  APPLE_REVIEWER: 134217728, // 1 << 27
  /**
   * Is this even used?
   */
  PCS: 268435456, // 1 << 28
  /** @deprecated */
  ENTERTAINER: 536870912, // 1 << 29
  /** @deprecated */
  SHADOW_BANNED: 1073741824 // 1 << 30
};
export default UserPrivilege;
