export enum UserPrivilege {

  SUBSCRIBER = 1, // has an account
  BOT_TESTER = 1 << 1, // can use the forum
  HOST = 1 << 2, // awarded by staff for people who play this role in a channel
  CONTENT_SUBMITER = 1 << 3, // has a blog
  SELECT_CLUB_1 = 1 << 4, // ??
  ADMIN_AREA = 1 << 5, // can access the admin area
  ELITE_CLUB_1 = 1 << 6, // Elite Club Gold tag for users ranked 1-3; User can't be kicked, silenced, banned (except by Staff)
  NUMBER_ONE_USER = 1 << 7, // is the number one user on the service
  WELCOME_HOST = 1 << 8, // can create forums and categories
  VOLUNTEER = 1 << 9, // community volunteer tag
  SELECT_CLUB_2 = 1 << 10, // ??
  ALPHA_TESTER = 1 << 11, // Alpha Tester - Used on bots to internally mark a bot as Open Beta within the framework
  STAFF = 1 << 12, // palringo staff
  DJ = 1 << 13, // awarded by staff for people who play this role in a channel
  DEVELOPER = 1 << 14, // developers
  PRIVILEGE_ADMIN = 1 << 15, // can change user privileges
  CHARM_ACTIVE = 1 << 16, // ??
  ELITE_CLUB_2 = 1 << 17, // Elite Club Silver tag for users ranked 4-10
  CONTENT_CREATOR = 1 << 18, // Content Creator tag
  VALID_EMAIL = 1 << 19, // the user has validated their email
  PREMIUM_ACCT = 1 << 20, // the user has bought a premium account
  WOLFSTAR = 1 << 21, // wolfstar
  ELITE_CLUB_3 = 1 << 22, // Elite Club Bronze tag for users ranked 11-20
  WOLFSTAR_PRO = 1 << 23, // wolfstar pro
  USER_ADMIN = 1 << 24, // Can do user moderator functions
  GROUP_ADMIN = 1 << 25, // Can do group admin functionality.
  BOT = 1 << 26, // Bot
  APPLE_REVIEWER = 1 << 27, // Subscriber is an apple reviewer
  PCS = 1 << 28, // Agent Palringo Community Support
  ENTERTAINER = 1 << 29, // Entertainer Tag
  SHADOW_BANNED = 1 << 30, // User is shadow banned

}
