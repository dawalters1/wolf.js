
class CharmSelectedBuilder {
  constructor (charmId, position) {
    this.charmId = charmId;
    this.position = position;
  }

  toCharmSelected () {
    return {
      charmId: this.charmId,
      position: this.position
    };
  }
}

export default CharmSelectedBuilder;
