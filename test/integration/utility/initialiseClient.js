// test/setupClient.js
import WOLF from '../../../src/client/WOLF.js';

/**
 *
 * @returns {WOLF}
 */
export default async function initialiseClient () {
  if (global.client) { return global.client; } // already initialized
  const args = process.env;

  const email = args.npm_config_email;
  const password = args.npm_config_password;
  const apiKey = args.npm_config_apikey;

  if (!email || !password) {
    throw new Error('Email and password must be provided');
  }

  return new Promise((resolve, reject) => {
    const client = new WOLF();
    global.client = client;

    client.once('ready', () => {
      resolve(client);
    });

    client.once('loginFailed', reject);

    client.login(email, password, apiKey);
  });
}
