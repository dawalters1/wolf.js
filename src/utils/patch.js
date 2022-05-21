
module.exports = (oldData, newData) => {
  for (const key in newData) {
    oldData[key] = newData[key];
  }
};
