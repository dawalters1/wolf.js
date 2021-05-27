const fs = require('fs');

const path = require('path');

module.exports = (bot) => {
  return fs.readdirSync(path.resolve(__dirname, './utilities')).reduce((result, fileName) => {
    const Utility = require(path.resolve(__dirname, `./utilities/${fileName}`));

    const utility = new Utility(bot);

    result[utility.utilityName] = (...args) => utility._function(...args);

    return result;
  }, {});
};
