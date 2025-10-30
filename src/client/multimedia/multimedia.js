import { aws4Interceptor } from 'aws4-axios';
import axios from 'axios';
import {
  CognitoIdentityClient,
  NotAuthorizedException
} from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentity } from '@aws-sdk/credential-provider-cognito-identity';
import WOLFResponse from '../../entities/WOLFResponse.js';

/**
 * @param {import('../WOLF.js').default} client
 */
class Multimedia {
  #axios;
  #client;
  constructor (client) {
    this.#client = client;
    this.#axios = axios.create();

    this.#axios.interceptors.request.use(
      aws4Interceptor({
        instance: axios,
        options: {
          region: 'eu-west-1',
          service: 'execute-api'
        },
        credentials: {
          getCredentials: async () => {
            const getCredentials = async (forceNew = false) => {
              try {
                const cognito = await this.#client.security.getToken({ forceNew });

                const cognitoIdentity = new CognitoIdentityClient({
                  credentials: fromCognitoIdentity({
                    client: new CognitoIdentityClient({
                      region: 'eu-west-1'
                    }),
                    identityId: cognito.identity,
                    logins: {
                      'cognito-identity.amazonaws.com': cognito.token
                    }
                  })
                });

                return await cognitoIdentity.config.credentials();
              } catch (error) {
                if (error instanceof NotAuthorizedException) {
                  return await getCredentials(true);
                }
                throw error;
              }
            };

            return await getCredentials();
          }
        }
      })
    );
  }

  async post (config, body) {
    return await this.#axios(
      {
        method: 'POST',
        baseURL: this.#client.config.endpointConfig.mmsUploadEndpoint,
        url: config.path,
        data: body
          ? { body }
          : undefined
      }
    )
      .then((response) => new WOLFResponse(response.data))
      .catch((error) => new WOLFResponse({ code: error.response?.code || error.response?.status, headers: error.response?.headers }));
  }

  async delete (config, body) {
    return await this.#axios(
      {
        method: 'DELETE',
        baseURL: this.#client.config.endpointConfig.mmsUploadEndpoint,
        url: config.path,
        data: body
          ? { body }
          : undefined
      }
    )
      .then((response) => new WOLFResponse(response.data))
      .catch((error) => new WOLFResponse({ code: error.response?.code || error.response?.status, headers: error.response?.headers }));
  }
}

export default Multimedia;
