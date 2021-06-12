const AWS = require('aws-sdk');
const Signer = AWS.Signers.V4;
const Response = require('../networking/Response');
const superagent = require('superagent');

const _getCredentials = async (bot) => {
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityId: bot._cognito.identity,
    Logins: {
      'cognito-identity.amazonaws.com': bot._cognito.token
    }
  }, {
    region: 'eu-west-1'
  });

  return new Promise((resolve) => {
    const onCredentials = (credentials) =>
    { 
      resolve(credentials);
    };

    AWS.config.credentials.get(function () {
      onCredentials(AWS.config.credentials);
    });
  });
};

module.exports = class MultiMediaService {
    constructor(bot){
        this._bot = bot;
        this._client = new AWS.HttpClient();
    }

    async _getCredentialsIfNeeded(){
      if(this._creds && !this._client.expired){
        return this._creds;
      }

      this._creds = await _getCredentials(this._bot);
      return this._creds;
    }

    async request(method, route, body) {

      const data = JSON.stringify({body});

        const request = new AWS.HttpRequest(this._bot._endpointConfig.mmsUploadEndpoint + route, 'eu-west-1');
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
            response.on('data', function (chunk) { responseBody += chunk;});
            
            response.on('end', function () { resolve(new Response(JSON.parse(responseBody)));});

          }, function (error) {
            reject(error);
          });
        });

        return res;
    }
}