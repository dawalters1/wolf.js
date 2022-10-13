class StoreProductDuration {
  constructor (data) {
    this.id = data?.id;
    this.credits = data?.credits;
    this.days = data?.days;
  }

  toJSON () {
    return {
      id: this.id,
      credits: this.credits,
      days: this.days
    };
  }
}

export default StoreProductDuration;
