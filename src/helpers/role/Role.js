import BaseHelper from '../BaseHelper.js';
import Role from '../../entities/Role.js';

export default class RoleHelper extends BaseHelper {
  async fetch (roleIds, languageId, opts) {
    const isArrayResponse = Array.isArray(roleIds);
    const normalisedRoleIds = this.normaliseNumbers(roleIds);
    const normalisedLanguageId = this.normaliseNumber(languageId);

    const idsToFetch = opts?.forceNew
      ? normalisedRoleIds
      : normalisedRoleIds.filter((roleId) =>
        !this.store.has((item) => item.id === roleId && item.languageId === normalisedLanguageId)
      );

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
        'group role',
        {
          body: {
            idList: idsToFetch,
            languageId: normalisedLanguageId
          }
        }
      );

      const maxAge = response.headers?.maxAge;

      for (const [index, childResponse] of response.body.entries()) {
        const roleId = idsToFetch[index];

        if (!childResponse.success) {
          this.store.delete((item) => item.id === roleId && item.languageId === normalisedLanguageId);
          continue;
        }

        this.store.set(
          new Role(this.client, childResponse.body),
          maxAge
        );
      }
    }

    const roles = normalisedRoleIds.map((roleId) => this.store.get((item) => item.id === roleId && item.languageId === normalisedLanguageId));

    return isArrayResponse
      ? roles
      : roles[0];
  }
}
