const AWS = require('aws-sdk');
const Signer = AWS.Signers.V4;
const Response = require('../networking/Response');

const valid = () => AWS.config.credentials && !AWS.config.credentials.needsRefresh() && !AWS.config.credentials.expired && AWS.config.credentials.accessKeyId && AWS.config.credentials.secretAccessKey && AWS.config.credentials.sessionToken;

const _requestToken = async (api, attempt = 1) => {
  const result = await api.websocket.emit('security token refresh');

  if (result.success) {
    api._cognito = result.body;
  } else if (attempt < 3) {
    await api.utility().delay(350);
    await _requestToken(api, attempt + 1);
  } else {
    api._cognito = null;
  }
};

const _getCredentials = async (api, refresh = false) => {
  if (refresh) {
    await _requestToken(api);
  }

  return new Promise((resolve) => {
    const onCredentials = (credentials) => resolve(credentials);

    if (!refresh) {
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityId: api._cognito.identity,
        Logins: {
          'cognito-identity.amazonaws.com': api._cognito.token
        }
      }, {
        region: 'eu-west-1'
      });

      AWS.config.credentials.get(function () {
        onCredentials(AWS.config.credentials);
      });
    } else {
      AWS.config.credentials.params.Logins['cognito-identity.amazonaws.com'] = api._cognito.token;
      AWS.config.credentials.refresh();
      AWS.config.credentials.get(function () {
        onCredentials(AWS.config.credentials);
      });
    }
  });
};

module.exports = class MultiMediaService {
  constructor (api) {
    this._api = api;
    this._client = new AWS.HttpClient();
  }

  async _getCredentialsIfNeeded () {
    if (this._creds && valid()) {
      return this._creds;
    }

    this._creds = await _getCredentials(this._api, this._creds);

    if (valid()) {
      return this._creds;
    }

    return await this._getCredentialsIfNeeded();
  }

  async request (method, route, body) {
    const data = JSON.stringify({ body });

    const request = new AWS.HttpRequest(this._api._endpointConfig.mmsUploadEndpoint + route, 'eu-west-1');
    request.method = method.toUpperCase();
    request.headers = {
      'Content-Length': data.length,
      'Content-Type': 'application/json',
      Host: request.endpoint.host
    };

    request.body = data;

    const signer = new Signer(request, 'execute-api');
    signer.addAuthorization(await this._getCredentialsIfNeeded(), new Date());

    const res = await new Promise((resolve, reject) => {
      this._client.handleRequest(request, null, function (response) {
        let responseBody = '';
        response.on('data', function (chunk) { responseBody += chunk; });

        response.on('end', function () { resolve(new Response(JSON.parse(responseBody))); });
      }, function (error) {
        reject(error);
      });
    });

    return res;
  }
};
