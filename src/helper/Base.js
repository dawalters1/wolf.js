/**
 * @param {import('../client/WOLF')} client
 */
class Base {
  constructor (client) {
    this.client = client;
  }

  _cleanUp (reconnection = false) {

  }
}

export default Base;
