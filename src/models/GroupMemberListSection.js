
class GroupMemberListSection {
  constructor () {
    this.list = [];
    this.complete = false;
  }

  _add (value, finalised = false) {
    this.list.push(...(Array.isArray(value) ? value : [value]));

    this.complete = this.complete ? this.complete : finalised;

    return value;
  }

  _remove (id) {
    this.list.splice(this.list.findIndex((member) => member.id === id), 1);
  }
}

export { GroupMemberListSection };
