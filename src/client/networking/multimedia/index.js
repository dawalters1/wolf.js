const axios = require('axios');
const { aws4Interceptor } = require('aws4-axios');
const { CognitoIdentityClient } = require('@aws-sdk/client-cognito-identity');
const { fromCognitoIdentity } = require('@aws-sdk/credential-provider-cognito-identity');

const Response = require('../../../models/ResponseObject');

const validator = require('../../../validator');

const imageSize = require('image-size');
const fileType = require('file-type');

const { v4: uuidv4 } = require('uuid');

const buildRoute = (route) => {
  return `/v${route.version}/${route.route}`;
};

/**
 * {@hideconstructor}
 */
module.exports = class MultiMediaServiceClient {
  constructor (api) {
    this._api = api;

    axios.interceptors.request.use(
      aws4Interceptor(
        {
          region: 'eu-west-1',
          service: 'execute-api'
        },
        {
          getCredentials: async () => {
            const getCredentials = async (forceNew = false) => {
              try {
                const cognito = await this._api.getSecurityToken(forceNew);

                const cognitoIdentity = new CognitoIdentityClient(
                  {
                    credentials: fromCognitoIdentity(
                      {
                        client: new CognitoIdentityClient(
                          {
                            region: 'eu-west-1'
                          }
                        ),
                        identityId: cognito.identity,
                        logins: {
                          'cognito-identity.amazonaws.com': cognito.token
                        }
                      }
                    )
                  }
                );

                return await cognitoIdentity.config.credentials();
              } catch (error) {
                if (error instanceof (await import('@aws-sdk/client-sso-oidc/dist-cjs/models/models_0.js')).ExpiredTokenException) {
                  return await getCredentials(true);
                }

                throw error;
              }
            };

            return await getCredentials();
          }
        }
      )
    );
  }

  async _upload (route, body) {
    return await new Promise((resolve) => {
      axios.post(`${this._api.endpointConfig.mmsUploadEndpoint}${route}`, { body })
        .then((res) => resolve(new Response(res.data)))
        .catch((error) => resolve(new Response({ code: error.response?.code || error.response?.status, headers: error.response?.headers })));
    });
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

    const messagingSettings = this._api._botConfig.get('multimedia.messaging');

    if (!messagingSettings.validation.mimes.includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    const ext = (await fileType.fromBuffer(content)).ext;

    if (Buffer.byteLength(content) > messagingSettings.validation.size[ext]) {
      throw new Error(`maximum size allowed for mimeType ${mimeType} is ${messagingSettings.validation.size[ext]} bytes`);
    }

    const data = {
      data: mimeType === 'audio/x-m4a' ? content : content.toString('base64'),
      mimeType: mimeType === 'audio/x-m4a' ? 'audio/aac' : mimeType,
      recipient: targetId,
      isGroup: targetType === 'group',
      flightId: uuidv4()
    };

    return this._upload(buildRoute(messagingSettings), data);
  }

  async uploadGroupAvatar (targetGroupId, avatar, mimeType) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!Buffer.isBuffer(avatar)) {
      throw new Error('avatar must be a buffer');
    }

    const groupAvatarSettings = this._api._botConfig.get('multimedia.avatar.group');

    if (!groupAvatarSettings.validation.mimes.includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    const size = imageSize(avatar);

    if (size.width !== size.height) {
      throw new Error('avatar must be square');
    }

    const ext = (await fileType.fromBuffer(avatar)).ext;

    if (Buffer.byteLength(avatar) > groupAvatarSettings.validation.size[ext]) {
      throw new Error(`maximum size allowed for mimeType ${mimeType} is ${groupAvatarSettings.validation.size[ext]} bytes`);
    }

    const body = {
      data: avatar.toString('base64'),
      mimeType,
      id: targetGroupId,
      source: this._api.currentSubscriber.id
    };

    return this._upload(buildRoute(groupAvatarSettings), body);
  }

  async uploadSubscriberAvatar (avatar, mimeType) {
    if (!Buffer.isBuffer(avatar)) {
      throw new Error('avatar must be a buffer');
    }
    const subscriberAvatarSettings = this._api._botConfig.get('multimedia.avatar.subscriber');

    if (!subscriberAvatarSettings.validation.mimes.includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    const size = imageSize(avatar);

    if (size.width !== size.height) {
      throw new Error('avatar must be square');
    }

    const ext = (await fileType.fromBuffer(avatar)).ext;

    if (Buffer.byteLength(avatar) > subscriberAvatarSettings.validation.size[ext]) {
      throw new Error(`maximum size allowed for mimeType ${mimeType} is ${subscriberAvatarSettings.validation.size[ext]} bytes`);
    }

    const body = {
      data: avatar.toString('base64'),
      mimeType
    };

    return this._upload(buildRoute(subscriberAvatarSettings), body);
  }

  async uploadEventThumbnail (eventId, thumbnail, mimeType) {
    if (!Buffer.isBuffer(thumbnail)) {
      throw new Error('thumbnail must be a buffer');
    }

    const eventThumbnailSettings = this._api._botConfig.get('multimedia.event');

    if (!eventThumbnailSettings.validation.mimes.includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    const size = imageSize(thumbnail);

    if (size.width !== size.height) {
      throw new Error('thumbnail must be square');
    }

    const body = {
      data: thumbnail.toString('base64'),
      mimeType,
      id: eventId,
      source: this._api.currentSubscriber.id
    };

    return this._upload(buildRoute(eventThumbnailSettings), body);
  }
};
