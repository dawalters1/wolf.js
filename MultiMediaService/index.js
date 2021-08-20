const AWS = require('aws-sdk');
const Signer = AWS.Signers.V4;
const Response = require('../networking/Response');

const validator = require('@dawalters1/validator');
const imageSize = require('image-size');

module.exports = class MultiMediaServiceClient {
  constructor (api) {
    this._api = api;
    this._client = new AWS.HttpClient();
  }

  async _credentials (requestNew = false) {
    if (this._creds && !requestNew) {
      return this._creds;
    }

    // TODO: handle getting new/assigning creds
  }

  async _sign (request) {
    try {
      new Signer(request, 'execute-api').addAuthorization(await this._credentials(), new Date());
    } catch (error) {
      // TODO: handle getting new
    }
  }

  async _sendRequest (route, body) {
    const data = JSON.stringify({ body });

    const request = new AWS.HttpRequest(`${this._api._endpointConfig.mmsUploadEndpoint}${route}`, 'eu-west-1');
    request.method = 'POST';
    request.headers = {
      'Content-Length': data.length,
      'Content-Type': 'application/json',
      Host: request.endpoint.host
    };

    request.body = data;

    await this._sign(request);

    return await new Promise((resolve, reject) => {
      this._client.handleRequest(request, null, function (response) {
        let responseBody = '';
        response.on('data', function (chunk) { responseBody += chunk; });

        response.on('end', function () { resolve(new Response(JSON.parse(responseBody))); });
      }, function (error) {
        reject(error);
      });
    });
  }

  async sendMessage (targetType, targetId, content, mimeType) {
    if (!validator.isNullOrWhitespace(targetType)) {
      throw new Error('targetType must be a valid number');
    } else if (['group', 'private'].includes(targetType)) {
      throw new Error('targetType is not valid');
    }

    if (!validator.isValidNumber(targetId)) {
      throw new Error('targetId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetId)) {
      throw new Error('targetId cannot be less than or equal to 0');
    }

    if (!Buffer.isBuffer(content)) {
      throw new Error('content must be a buffer');
    }

    if (['image/jpeg', 'image/gif'].includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    const body = {
      data: content.toString('base64'),
      mimeType,
      recipient: targetId,
      isGroup: targetType === 'group',
      source: this._api.currentSubscriber.id
    };

    return this._sendRequest('/v1/send-message/', body);
  }

  async uploadGroupAvatar (targetGroupId, avatar, mimeType) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!Buffer.isBuffer(avatar)) {
      throw new Error('content must be a buffer');
    }

    if (['image/jpeg', 'image/gif'].includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    const size = imageSize(avatar);

    if (size.width !== size.height) {
      throw new Error('image must be square');
    }

    const body = {
      data: avatar.toString('base64'),
      mimeType,
      id: targetGroupId,
      source: this._api.currentSubscriber.id
    };

    return this._sendRequest('/v1/group-avatar-update', body);
  }

  async uploadSubscriberAvatar (avatar, mimeType) {
    if (!Buffer.isBuffer(avatar)) {
      throw new Error('content must be a buffer');
    }

    if (['image/jpeg', 'image/gif'].includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    const size = imageSize(avatar);

    if (size.width !== size.height) {
      throw new Error('image must be square');
    }

    const body = {
      data: avatar.toString('base64'),
      mimeType,
      id: this._api.currentSubscriber.id,
      source: this._api.currentSubscriber.id
    };

    return this._sendRequest('/v1/subscriber-avatar-update', body);
  }

  async uploadEventAvatar (eventId, thumbnail, mimeType) {
    if (!Buffer.isBuffer(thumbnail)) {
      throw new Error('thumbnail must be a buffer');
    }

    if (['image/jpeg'].includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    const size = imageSize(thumbnail);

    if (size.width !== size.height) {
      throw new Error('image must be square');
    }

    const body = {
      data: thumbnail.toString('base64'),
      mimeType: '',
      id: eventId,
      source: this._api.currentSubscriber.id
    };

    return this._sendRequest('/v1/group-event-image-update', body);
  }
};
