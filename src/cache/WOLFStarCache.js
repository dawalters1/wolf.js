import Base from './Base.js';

class WOLFStarCache extends Base {
  constructor () {
    super(300);
  }

  get (userId) {
    return this.cache.get(userId) ?? null;
  }

  set (users) {
    const result = (Array.isArray(users) ? users : [users])
      .reduce((results, user) => {
        const existing = this.cache.get(user.id);

        results.push(
          this.cache.set(
            user.id,
            existing?._patch(user) ?? user

          ).get(user.id)
        );

        return results;
      }, []);

    return Array.isArray(users) ? result : result[0];
  }

  delete (userId) {
    return this.cache.delete(userId);
  }
}

export default WOLFStarCache;
