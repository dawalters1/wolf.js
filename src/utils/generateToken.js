const CryptoJS = require('crypto-js/sha256');

/**
 * Generate a "UNIQUE" connection token using email and password SHA1 hashing
 * @param {import('../client/WOLF')} client
 * @returns Token generated using email and password
 */
module.exports = async (client) => `WJS${CryptoJS.HmacSHA1(client.config.get('app.login.email'), client.config.get('app.login.password').toString(CryptoJS.enc.Hex))}`;
