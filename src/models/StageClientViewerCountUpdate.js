
class StageClientViewerCountUpdate {
  constructor (data) {
    this.targetGroupId = data?.targetGroupId;
    this.oldBroadcasterCount = data?.oldBroadcasterCount;
    this.newBroadcasterCount = data?.newBroadcasterCount;
    this.newConsumerCount = data?.newConsumerCount;
    this.oldConsumerCount = data?.oldConsumerCount;
  }
}

export default StageClientViewerCountUpdate;
