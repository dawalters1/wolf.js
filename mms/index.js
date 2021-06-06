const AWS = require('aws-sdk');
const Signer = AWS.Signers.V4;
const Response = require('../networking/Response');
const {
  v4: uuidv4
} = require('uuid');

const targetTypes = {
  GROUP: 'group',
  PRIVATE: 'private'
};

const routes = {
  MESSAGE_SEND: '/v1/send-message/',
  EVENT_IMAGE: '/v1/group-event-image-update',
  SUBSCRIBER_AVATAR_UPLOAD: '/v1/subscriber-avatar-update',
  GROUP_AVATAR_UPLOAD: '/v1/group-avatar-update'
};

const getCredentials = (bot) => {
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityId: bot._cognito.identity,
    Logins: {
      'cognito-identity.amazonaws.com': bot._cognito.token
    }
  }, {
    region: 'eu-west-1'
  });

  return new Promise((resolve) => {
    const test = (credentials) => {
      resolve(credentials);
    };

    AWS.config.credentials.get(function () {
      test(AWS.config.credentials);
    });
  });
};

module.exports = class Multimedia {
  constructor (bot) {
    this._bot = bot;
  }

  async _request (method, route, body) {
    const request = new AWS.HttpRequest(this._bot._endpointConfig.mmsUploadEndpoint + route, 'eu-west-1');
    request.method = method.toUpperCase();
    request.headers = {
      'Content-Length': body.length,
      'Content-Type': 'application/json',
      Host: request.endpoint.host
    };
    request.body = body;

    const signer = new Signer(request, 'execute-api');
    signer.addAuthorization(await getCredentials(this._bot), new Date());

    return new Promise((resolve, reject) => {
      new AWS.HttpClient().handleRequest(request, null, function (response) {
        let responseBody = '';
        response.on('data', function (chunk) {
          responseBody += chunk;
        });
        response.on('end', function (chunk) {
          resolve(new Response(responseBody));
        });
      }, function (error) {
        reject(error);
      });
    });
  }

  async _sendMessage (targetType, targetId, data, mimeType) {
    const body = JSON.stringify({
      body: {
        data: Buffer.from(data).toString('base64'),
        recipient: targetId,
        isGroup: targetType === targetTypes.GROUP,
        mimeType: mimeType,
        flightId: uuidv4()
      }
    });

    return await this._request('post', routes.MESSAGE_SEND, body);
  }

  async _uploadEventImage (eventId, data) {
    const body = JSON.stringify({
      body: {
        eventId,
        byteArray: Buffer.from(data)
      }
    });

    return await this._request('post', routes.EVENT_IMAGE, body);
  }

  async _uploadSubscriberAvatar (avatar) {
    const body = JSON.stringify({
      body: {
        data: Buffer.from(avatar).toString('base64'),
        mimeType: 'image/jpeg'
      }
    });

    return await this._request('post', routes.SUBSCRIBER_AVATAR_UPLOAD, body);
  }

  async _uploadGroupAvatar (groupId, avatar) {
    const body = JSON.stringify({
      body: {
        groupId,
        data: Buffer.from(avatar).toString('base64'),
        mimeType: 'image/jpeg'
      }
    });

    return await this._request('post', routes.GROUP_AVATAR_UPLOAD, body);
  }
};
