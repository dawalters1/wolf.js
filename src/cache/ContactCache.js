import Base from './Base.js';

class ContactCache extends Base {
  constructor () {
    super();

    this.fetched = false;
  }

  list () {
    return this.cache.values();
  }

  get (userId) {
    return this.cache.get(userId) ?? null;
  }

  set (contacts) {
    const result = (Array.isArray(contacts) ? contacts : [contacts])
      .reduce((results, contact) => {
        const existing = this.cache.get(contact.id);

        results.push(
          this.cache.set(
            contact.id,
            existing?._patch(contact) ?? contact

          ).get(contact.id)
        );

        return results;
      }, []);

    return Array.isArray(contacts) ? result : result[0];
  }

  delete (userId) {
    return this.cache.delete(userId);
  }
}

export default ContactCache;
