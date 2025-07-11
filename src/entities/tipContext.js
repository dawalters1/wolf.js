
export class TipContext {
  /**
   * @param {string} type - Context type (e.g. from ContextType enum or string)
   * @param {number|undefined} id - Identifier for the context
   */
  constructor (type, id) {
    this.type = type;
    this.id = id;
  }
}

export default TipContext;
