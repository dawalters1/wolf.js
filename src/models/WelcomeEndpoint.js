import Base from './Base.js';

class WelcomeEndpoint extends Base {
  constructor (client, data) {
    super(client);
    this.avatarEndpoint = data?.avatarEndpoint;
    this.mmsUploadEndpoint = data?.mmsUploadEndpoint;
  }

  toJSON () {
    return {
      avatarEndpoint: this.avatarEndpoint,
      mmsUploadEndpoint: this.mmsUploadEndpoint
    };
  }
}

export default WelcomeEndpoint;
