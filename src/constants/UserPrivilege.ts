export enum UserPrivilege {
  SUBSCRIBER = 1, // 1
  BOT_TESTER = 2, // 1 << 1
  HOST = 4, // 1 << 2
  CONTENT_SUBMITER = 8, // 1 << 3
  SELECT_CLUB_1 = 16, // 1 << 4
  ADMIN_AREA = 32, // 1 << 5
  ELITE_CLUB_1 = 64, // 1 << 6
  NUMBER_ONE_USER = 128, // 1 << 7
  WELCOME_HOST = 256, // 1 << 8
  VOLUNTEER = 512, // 1 << 9
  SELECT_CLUB_2 = 1024, // 1 << 10
  ALPHA_TESTER = 2048, // 1 << 11
  STAFF = 4096, // 1 << 12
  DJ = 8192, // 1 << 13
  DEVELOPER = 16384, // 1 << 14
  PRIVILEGE_ADMIN = 32768, // 1 << 15
  CHARM_ACTIVE = 65536, // 1 << 16
  ELITE_CLUB_2 = 131072, // 1 << 17
  CONTENT_CREATOR = 262144, // 1 << 18
  VALID_EMAIL = 524288, // 1 << 19
  PREMIUM_ACCT = 1048576, // 1 << 20
  WOLFSTAR = 2097152, // 1 << 21
  ELITE_CLUB_3 = 4194304, // 1 << 22
  WOLFSTAR_PRO = 8388608, // 1 << 23
  USER_ADMIN = 16777216, // 1 << 24
  GROUP_ADMIN = 33554432, // 1 << 25
  BOT = 67108864, // 1 << 26
  APPLE_REVIEWER = 134217728, // 1 << 27
  PCS = 268435456, // 1 << 28
  /** @deprecated */
  ENTERTAINER = 536870912, // 1 << 29
  /** @deprecated */
  SHADOW_BANNED = 1073741824 // 1 << 30
}
