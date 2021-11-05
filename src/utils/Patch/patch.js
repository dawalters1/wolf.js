/**
 * Merge two objects, replacing any existing fields with new data
 * @param {Object} oldData - The old object
 * @param {Object} newData - The new object
 * @returns {Object} - Returns merged objects
 */
module.exports = async (oldData, newData) => {
  for (const key in newData) {
    oldData[key] = newData[key];
  }
};
