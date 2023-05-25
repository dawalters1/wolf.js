import axios from 'axios';
import { aws4Interceptor } from 'aws4-axios';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentity } from '@aws-sdk/credential-provider-cognito-identity';
import Response from '../../models/Response.js';

class Multimedia {
  /**
   * @param {import('../WOLF').default} client
   */
  constructor (client) {
    this.client = client;

    axios.interceptors.request.use(
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
                  if (error instanceof (await import('@aws-sdk/client-sso-oidc/dist-cjs/models/models_0.js')).ExpiredTokenException) {
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
    return await new Promise((resolve) => {
      axios.post(`${this.client.config.endpointConfig.mmsUploadEndpoint}/v${config.version}/${config.route}`, { body })
        .then((res) => resolve(new Response(res.data)))
        .catch((error) => resolve(new Response({ code: error.response?.code || error.response?.status, headers: error.response?.headers })));
    });
  }
}

export default Multimedia;
