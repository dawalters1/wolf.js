const AWS = require('aws-sdk');
const Signer = AWS.Signers.V4;
const Response = require('../networking/Response');

const validator = require('../utils/validator');

const imageSize = require('image-size');

const {
  v4: uuidv4
} = require('uuid');

module.exports = class MultiMediaServiceClient {
  constructor (api) {
    this._api = api;
    this._client = new AWS.HttpClient();

    this._api.on.loginSuccess(() => {
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityId: this._api._cognito.identity,
        Logins: {
          'cognito-identity.amazonaws.com': this._api._cognito.token
        }
      }, {
        region: 'eu-west-1'
      });
    });

    this._api.on.reconnected(async () => {
      await this._credentials(true);
    });
  }

  async _credentials (requestNew = false) {
    const result = await new Promise((resolve) => {
      const onCredentials = (creds) => resolve(creds);

      if (!requestNew) {
        AWS.config.credentials.get(function () {
          onCredentials(AWS.config.credentials);
        });
      } else {
        this._api.getSecurityToken(true).then((cognito) => {
          AWS.config.credentials.params.Logins['cognito-identity.amazonaws.com'] = cognito.token;
          AWS.config.credentials.refresh();
          AWS.config.credentials.get(function () {
            onCredentials(AWS.config.credentials);
          });
        }).catch((error) => {
          console.log('Failed to retrieve AWS credentials: ', error);

          return this._credentials(true);
        });
      }
    });

    if (AWS.config.credentials.needsRefresh() || AWS.config.credentials.expired || AWS.config.credentials.accessKeyId === undefined || AWS.config.credentials.secretAccessKey === undefined || AWS.config.credentials.sessionToken === undefined) {
      return await this._credentials(true);
    }
    this._creds = result;

    return this._creds;
  };

  async _sign (request, retry = false) {
    new Signer(request, 'execute-api').addAuthorization(await this._credentials(retry), new Date());
  }

  async _sendRequest (route, body, attempt = 1) {
    try {
      const data = JSON.stringify({ body });

      const awsRequest = new AWS.HttpRequest(`${this._api._endpointConfig.mmsUploadEndpoint}${route}`, 'eu-west-1');
      awsRequest.method = 'POST';
      awsRequest.headers = {
        'Content-Length': data.length,
        'Content-Type': 'application/json',
        Host: awsRequest.endpoint.host
      };

      awsRequest.body = data;

      new Signer(awsRequest, 'execute-api').addAuthorization(await this._credentials(), new Date());

      return await new Promise((resolve, reject) => {
        this._client.handleRequest(awsRequest, null, function (response) {
          let responseBody = '';
          response.on('data', function (chunk) { responseBody += chunk; });

          response.on('end', function () {
            try {
              resolve(new Response(JSON.parse(responseBody)));
            } catch (error) {
              reject(responseBody);
            }
          });
        }, function (error) {
          reject(error);
        });
      });
    } catch (error) {
      await this._credentials(true);

      if (attempt <= 3) {
        return await this._sendRequest(route, body, attempt++);
      }

      throw error;
    }
  }

  async sendMessage (targetType, targetId, content, mimeType) {
    if (validator.isNullOrWhitespace(targetType)) {
      throw new Error('targetType cannot be null or empty');
    } else if (!['group', 'private'].includes(targetType)) {
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

    if (!['image/jpeg', 'image/gif'].includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    if (mimeType === 'audio/x-m4a') {
      mimeType = 'audio/m4a';
    }

    const body = {
      data: content.toString('base64'),
      mimeType,
      recipient: targetId,
      isGroup: targetType === 'group',
      source: this._api.currentSubscriber.id,
      flightId: uuidv4()
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

    if (!['image/jpeg', 'image/gif'].includes(mimeType)) {
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

    if (!['image/jpeg', 'image/gif'].includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    const size = imageSize(avatar);

    if (size.width !== size.height) {
      throw new Error('image must be square');
    }

    const body = {
      data: avatar.toString('base64'),
      mimeType
    };

    return this._sendRequest('/v1/subscriber-avatar-update', body);
  }

  async uploadEventAvatar (eventId, thumbnail, mimeType) {
    if (!Buffer.isBuffer(thumbnail)) {
      throw new Error('thumbnail must be a buffer');
    }

    if (!['image/jpeg'].includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    const size = imageSize(thumbnail);

    if (size.width !== size.height) {
      throw new Error('image must be square');
    }

    const body = {
      data: thumbnail.toString('base64'),
      mimeType,
      id: eventId,
      source: this._api.currentSubscriber.id
    };

    return this._sendRequest('/v1/group-event-image-update', body);
  }
};
