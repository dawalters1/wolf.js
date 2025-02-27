import Base from './Base.js';

class RoleCache extends Base {
  get (roleIds) {
    const result = (Array.isArray(roleIds) ? roleIds : [roleIds]).map((roleId) => this.cache?.get(roleId) ?? null);

    return Array.isArray(roleIds) ? result : result[0];
  }

  set (roles) {
    const result = (Array.isArray(roles) ? roles : [roles])
      .reduce((results, role) => {
        const existing = this.cache.get(role.id);

        results.push(
          this.cache.set(
            role.id,
            existing?._patch(role) ?? role

          ).get(role.id)
        );

        return results;
      }, []);

    return Array.isArray(roles) ? result : result[0];
  }

  delete (roleId) {
    return this.cache.delete(roleId);
  }
}

export default RoleCache;
