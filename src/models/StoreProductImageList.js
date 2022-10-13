class StoreProductImageList {
  constructor (data) {
    this.url = data?.url;
  }

  toJSON () {
    return {
      url: this.url
    };
  }
}

export default StoreProductImageList;
