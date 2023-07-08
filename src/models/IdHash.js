class IdHash {
  constructor (data) {
    this.id = data?.id;
    this.hash = data?.hash;
    this.nickname = data?.nickname;
  }

  toJSON () {
    return {
      id: this.id,
      hash: this.hash,
      nickname: this.nickname
    };
  }
}

export default IdHash;
