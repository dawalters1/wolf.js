const CryptoJS = require('crypto-js/sha256');

module.exports = async (client) => `WJS${CryptoJS.HmacSHA1(client.config.get('app.login.email'), client.config.get('app.login.password').toString(CryptoJS.enc.Hex))}`;
