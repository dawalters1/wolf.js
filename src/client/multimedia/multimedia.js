import { aws4Interceptor } from 'aws4-axios';
import axios from 'axios';
import {
  CognitoIdentityClient,
  NotAuthorizedException
} from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentity } from '@aws-sdk/credential-provider-cognito-identity';
import WOLFResponse from '../../entities/WOLFResponse.js';

class Multimedia {
  constructor (client) {
    this.client = client;
    this.axios = axios.create();

    this.axios.interceptors.request.use(
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
                const cognito = { identity: '', token: '' }; // TODO: replace with actual call to fetch credentials

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
    try {
      const response = await this.axios.post(
        `/v${config.version}/${config.route}`,
        body ? { body } : undefined
      );

      return new WOLFResponse(response.data);
    } catch (error) {
      return new WOLFResponse({
        code: error.response?.code || error.response?.status,
        headers: error.response?.headers
      });
    }
  }
}

export default Multimedia;
