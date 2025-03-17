
export const USER = 1; // has an account
export const BOT_TESTER = 1 << 1; // can use the forum
export const CONTENT_SUBMITER = 1 << 3; // has a blog
export const SELECT_CLUB_1 = 1 << 4; // ??
export const ADMIN_AREA = 1 << 5; // can access the admin area
export const ELITE_CLUB_1 = 1 << 6; // Elite Club Gold tag for users ranked 1-3; User can't be kicked, silenced, banned (except by Staff)
export const NUMBER_ONE_USER = 1 << 7; // is the number one user on the service
export const VOLUNTEER = 1 << 9; // community volunteer tag
export const SELECT_CLUB_2 = 1 << 10; // ??
export const ALPHA_TESTER = 1 << 11; // Alpha Tester - Used on bots to internally mark a bot as Open Beta within the framework
export const STAFF = 1 << 12; // palringo staff
export const DEVELOPER = 1 << 14; // developers
export const PRIVILEGE_ADMIN = 1 << 15; // can change user privileges
export const ELITE_CLUB_2 = 1 << 17; // Elite Club Silver tag for users ranked 4-10
export const CONTENT_CREATOR = 1 << 18; // Content Creator tag
export const VALID_EMAIL = 1 << 19; // the user has validated their email
export const PREMIUM_ACCOUNT = 1 << 20; // the user has bought a premium account
export const WOLFSTAR = 1 << 21; // wolfstar
export const ELITE_CLUB_3 = 1 << 22; // Elite Club Bronze tag for users ranked 11-20
export const WOLFSTAR_PRO = 1 << 23; // wolfstar pro
export const USER_ADMIN = 1 << 24; // Can do user moderator functions
export const GROUP_ADMIN = 1 << 25; // Can do group admin functionality.
export const BOT = 1 << 26; // Bot
export const ENTERTAINER = 1 << 29; // Entertainer Tag

export default {
  USER,
  BOT_TESTER,
  CONTENT_SUBMITER,
  SELECT_CLUB_1,
  ADMIN_AREA,
  ELITE_CLUB_1,
  NUMBER_ONE_USER,
  VOLUNTEER,
  SELECT_CLUB_2,
  ALPHA_TESTER,
  STAFF,
  DEVELOPER,
  PRIVILEGE_ADMIN,
  ELITE_CLUB_2,
  CONTENT_CREATOR,
  VALID_EMAIL,
  PREMIUM_ACCOUNT,
  WOLFSTAR,
  ELITE_CLUB_3,
  WOLFSTAR_PRO,
  USER_ADMIN,
  GROUP_ADMIN,
  BOT,
  ENTERTAINER
};
