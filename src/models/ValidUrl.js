class ValidUrl {
  constructor (url, hostname) {
    this.url = url;
    this.hostname = hostname;
  }

  toJSON () {
    return {
      url: this.url,
      hostname: this.hostname
    };
  }
}

export default ValidUrl;
