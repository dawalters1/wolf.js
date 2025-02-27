
class Base {
  constructor (client) {
    this.client = client;
  }

  get exists () {
    return Object.getOwnPropertyNames(this)
      .filter((name) =>
        name !== this.client
      ).length > 1;
  }

  _patch (oldData, newData) {
    // No object provided to patch
    if (!oldData) { return newData; }

    Object.keys(newData)
      .forEach((key) => {
        oldData[key] = newData[key];
      });

    return oldData;
  };
}

export default Base;
