
class StageClientViewerCountUpdate {
  constructor (data) {
    this.targetGroupId = data?.targetGroupId;
    this.newViewerCount = data?.newCount;
    this.oldViewerCount = data?.oldCount;
  }
}

export default StageClientViewerCountUpdate;
