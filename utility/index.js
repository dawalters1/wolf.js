const fs = require('fs');

const path = require('path');

module.exports = (api) => {
  return fs.readdirSync(path.resolve(__dirname, './utilities')).reduce((result, fileName) => {
    const Utility = require(path.resolve(__dirname, `./utilities/${fileName}`));

    const utility = new Utility(api);

    result[utility.utilityName] = (...args) => utility._func(...args);

    return result;
  }, {});
};
