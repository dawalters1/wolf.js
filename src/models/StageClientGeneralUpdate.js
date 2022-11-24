
class StageClientGeneralUpdate {
  constructor (data) {
    this.targetGroupId = data?.targetGroupId;
    this.sourceSubscriberId = data?.sourceSubscriberId;
    this.error = data?.error;
  }
}

export default StageClientGeneralUpdate;
