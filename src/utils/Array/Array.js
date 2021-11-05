const chunk = (array, n) => {
  if (!array || (array.length === 0 || n === 0)) {
    return array || [];
  }

  return [array.slice(0, n)].concat(chunk(array.slice(n), n));
};

module.exports = {
  chunk
};
