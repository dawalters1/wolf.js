// test/setupClient.js
import WOLF from '../../../../src/client/WOLF.js';

export default async function initialiseClient () {
  if (global.client) { return global.client; } // already initialized

  return new Promise((resolve, reject) => {
    const client = new WOLF();
    global.client = client;

    client.once('ready', () => {
      resolve(client);
    });

    client.once('loginFailed', reject);

    const { email, password, apiKey } = client.config.framework.mocha;
    client.login(email, password, apiKey);
  });
}
