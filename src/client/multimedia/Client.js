import axios from 'axios';
import aws4Axios from 'aws4-axios';
import AWS from 'aws-sdk';
import { Event } from '../../constants/index.js';
import Response from '../../models/Response.js';

const { aws4Interceptor } = aws4Axios;

class Multimedia {
  constructor (client) {
    this.client = client;

    this.credentialProvider = {
      getCredentials: async () => {
        if (AWS.config.credentials && !AWS.config.credentials.needsRefresh()) {
          return AWS.config.credentials;
        }

        const cognito = await this.client.misc.getSecurityToken(true);

        if (!AWS.config.credentials) {
          AWS.config.credentials = new AWS.CognitoIdentityCredentials(
            {
              IdentityId: cognito.identity,
              Logins: {
                'cognito-identity.amazonaws.com': cognito.token
              }
            },
            {
              region: 'eu-west-1'
            }
          );

          return await new Promise((resolve, reject) => {
            AWS.config.getCredentials((error) => {
              if (error) {
                this.client.emit(Event.INTERNAL_ERROR, error);
                reject(error);
              } else {
                resolve(AWS.config.credentials);
              }
            });
          });
        }

        AWS.config.credentials.params.Logins['cognito-identity.amazonaws.com'] = cognito.token;

        return await new Promise((resolve, reject) => {
          AWS.config.credentials.refresh((error) => {
            if (error) {
              this.client.emit(Event.INTERNAL_ERROR, error);
              reject(error);
            } else {
              resolve(AWS.config.credentials);
            }
          });
        });
      }
    };
  }

  async upload (config, body) {
    const interceptor = aws4Interceptor(
      {
        region: 'eu-west-1',
        service: 'execute-api'
      },
      this.credentialProvider
    );

    axios.interceptors.request.use(interceptor);

    return await new Promise((resolve) => {
      axios.post(`${this.client.config.endpointConfig.mmsUploadEndpoint}/v${config.version}/${config.route}`, { body })
        .then((res) => { resolve(new Response(res.data)); })
        .catch((error) => resolve(new Response({ code: error.response?.code || error.response?.status, headers: error.response?.headers })));
    });
  }
}

export default Multimedia;
