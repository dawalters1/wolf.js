import axios from 'axios';
import { aws4Interceptor } from 'aws4-axios';
import { CognitoIdentityClient, NotAuthorizedException } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentity } from '@aws-sdk/credential-provider-cognito-identity';
import Response from '../../models/Response.js';

class Multimedia {
  /**
   * @param {import('../WOLF').default} client
   */
  constructor (client) {
    this.client = client;
    this.axiosClient = axios.create();

    this.axiosClient.interceptors.request.use(
      aws4Interceptor(
        {
          instance: axios,
          options: {
            region: 'eu-west-1',
            service: 'execute-api'
          },
          credentials: {
            getCredentials: async () => {
              const getCredentials = async (forceNew = false) => {
                try {
                  const cognito = await this.client.misc.getSecurityToken(forceNew);

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
                  if (error instanceof NotAuthorizedException) {
                    return await getCredentials(true);
                  }

                  throw error;
                }
              };

              return await getCredentials();
            }
          }
        }
      )
    );
  }

  async upload (config, body) {
    return await this.request(config, body);
  }

  async request (config, body = undefined) {
    return await this.axiosClient(
      {
        method: config?.method ?? 'POST',
        baseURL: this.client.config.endpointConfig.mmsUploadEndpoint,
        url: `/v${config.version}/${config.route}`,
        data: body ? { body } : undefined
      }
    )
      .then((response) => new Response(response.data))
      .catch((error) => new Response({ code: error.response?.code || error.response?.status, headers: error.response?.headers }));
  }
}

export default Multimedia;
