import Base from './Base.js';

class BlackListLink extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.regex = data?.regex;
  }

  toJSON () {
    return {
      id: this.id,
      regex: this.regex
    };
  }
}

export default BlackListLink;
