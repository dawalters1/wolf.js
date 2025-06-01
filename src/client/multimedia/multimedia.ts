import { aws4Interceptor } from 'aws4-axios';
import axios, { AxiosInstance } from 'axios';
import { CognitoIdentityClient, NotAuthorizedException } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentity } from '@aws-sdk/credential-provider-cognito-identity';
import WOLF from '../WOLF.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

export class Multimedia {
  client: WOLF;
  axios: AxiosInstance;

  constructor (client: WOLF) {
    this.client = client;
    this.axios = axios.create();

    this.axios.interceptors.request.use(aws4Interceptor({
      instance: axios,
      options: {
        region: 'eu-west-1',
        service: 'execute-api'
      },
      credentials: {
        getCredentials: async () => {
          const getCredentials = async (forceNew = false) => {
            try {
              const cognito = { identity: '', token: '' };// TODO: // await this.client.misc.getSecurityToken(forceNew);

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
    }));
  }

  // TODO: update to typescript

  async post (config:any, body:any) : Promise<WOLFResponse> {
    return await this.axios.post(`/v${config.version}/${config.route}`,
      body ? { body } : undefined)
      .then((response) => new WOLFResponse(response.data))
      .catch((error) => new WOLFResponse({ code: error.response?.code || error.response?.status, headers: error.response?.headers }));
  }
}

export default Multimedia;
