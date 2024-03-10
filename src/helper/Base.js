
class Base {
  /**
   *
   * @param {import('../client/WOLF.js').default} client
   */
  constructor (client) {
    this.client = client;
  }

  _cleanUp (reconnection = false) {
  }
}

export default Base;
