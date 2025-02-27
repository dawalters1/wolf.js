import ExpiryMap from 'expiry-map';

class Base {
  constructor (ttl = 3600) {
    this.cache = new ExpiryMap(ttl);
  }

  list () {}
  get () {}
  set () {}
  delte () {}
}

export default Base;
