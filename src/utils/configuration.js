import path, { dirname } from 'path';
import fs from 'fs';
import yaml from 'yaml';
import { Language, OnlineState } from '../constants/index.js';
import _ from 'lodash';
import WOLFAPIError from '../models/WOLFAPIError.js';
import validator from '../validator/index.js';
import { fileURLToPath } from 'url';
import generateToken from './generateToken.js';
import SubscriptionIntent from '../constants/SubscriptionIntent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const internalGet = (config, path) => {
  if (validator.isNullOrUndefined(path)) {
    throw new WOLFAPIError('path cannot be null or undefined', { path });
  }

  return path.split('.')
    .filter(Boolean)
    .map((route) => route.trim()).reduce((result, value) => {
      const target = result[value];

      if (['undefined', 'function'].includes(typeof (target))) {
        throw new WOLFAPIError('non-existant path requested in config', { path });
      }

      return target;
    }, config);
};

const developerConfig = (client) => {
  const config = yaml.parse(fs.readFileSync(path.join(process.cwd(), '/config/default.yaml'), 'utf-8'));

  client.config = {
    keyword: config?.keyword ?? 'default',
    framework: {
      developer: typeof config?.framework?.developer === 'number' && config.framework.developer > 0 ? config.framework.developer : undefined,
      language: typeof config?.framework?.language === 'string' && config.framework.language.length === 2 && Object.values(Language).some((language) => client.utility.toLanguageKey(language) === config.framework.language.toLocaleLowerCase()) ? config.framework.language : 'en',
      login: {
        email: typeof config?.framework?.login?.email === 'string' ? config.framework.login.email : undefined,
        password: typeof config?.framework?.login?.password === 'string' ? config.framework.login.password : undefined,
        onlineState: typeof config?.framework?.login?.onlineState === 'number' && Object.values(OnlineState).includes(config.framework.login.onlineState) ? config.framework.login.onlineState : OnlineState.ONLINE,
        token: typeof config?.framework?.login?.token === 'string' ? config.framework.login.token : generateToken(config?.framework?.login?.email, config?.framework?.login?.password)
      },
      commands: {
        ignore: {
          official: typeof config?.framework?.commands?.ignore?.official === 'boolean' ? config.framework.commands.ignore.official : false,
          unofficial: typeof config?.framework?.commands?.ignore?.unofficial === 'boolean' ? config.framework.commands.ignore.unofficial : false,
          self: typeof config?.framework?.commands?.ignore?.self === 'boolean' ? config.framework.commands.ignore.self : true
        }
      },
      messages: {
        ignore: {
          self: typeof config?.framework?.messages?.ignore?.self === 'boolean' ? config.framework.messages.ignore.self : true
        }
      },
      subscriptions: {
        events: {
          subscriptions: typeof config?.framework?.subscriptions?.events?.subscriptions === 'boolean' ? config.framework.subscriptions.events.subscriptions : true,
          lineup: typeof config?.framework?.subscriptions?.events?.lineup === 'boolean' ? config.framework.subscriptions.events.lineup : true
        },
        profiles: {
          group: {
            updates: typeof config?.framework?.subscriptions?.profiles?.group?.updates === 'boolean' ? config.framework.subscriptions.profiles.group.updates : true
          },
          subscriber: {
            updates: typeof config?.framework?.subscriptions?.profiles?.subscriber?.updates === 'boolean' ? config.framework.subscriptions.profiles.subscriber.updates : true
          },
          event: {
            updates: typeof config?.framework?.subscriptions?.profiles?.event?.updates === 'boolean' ? config.framework.subscriptions.profiles.event.updates : true
          }
        },
        messages: {
          group: {
            enabled: typeof config?.framework?.subscriptions?.messages?.group?.enabled === 'boolean' ? config.framework.subscriptions.messages.group.enabled : true,
            tipping: typeof config?.framework?.subscriptions?.messages?.group?.tipping === 'boolean' ? config.framework.subscriptions.messages.group.tipping : true
          },
          private: {
            enabled: typeof config?.framework?.subscriptions?.messages?.private?.enabled === 'boolean' ? config.framework.subscriptions.messages.private.enabled : true,
            tipping: typeof config?.framework?.subscriptions?.messages?.private?.tipping === 'boolean' ? config.framework.subscriptions.messages.private.tipping : false
          }
        }
      }
    },
    ..._.omit(config, ['keyword', 'framework']) // Load reamining developer config
  };

  // This needs a better way
  client.config.framework.subscriptions.intents = (() => {
    let intent = 0;

    if (client.config.framework.subscriptions.messages.group.enabled) {
      intent += SubscriptionIntent.GROUP_MESSAGE;

      if (client.config.framework.subscriptions.messages.group.tipping) {
        intent += SubscriptionIntent.GROUP_MESSAGE_TIPPING;
      }
    }

    if (client.config.framework.subscriptions.messages.private.enabled) {
      intent += SubscriptionIntent.PRIVATE_MESSAGE;

      if (client.config.framework.subscriptions.messages.private.tipping) {
        intent += SubscriptionIntent.PRIVATE_MESSAGE_TIPPING;
      }
    }

    return intent;
  })();

  client.config.get = (path) => internalGet(client.config, path);
};

const frameworkConfig = (client) => {
  client._botConfig = yaml.parse(fs.readFileSync(path.join(__dirname, '../../config/default.yaml'), 'utf-8'));

  client._botConfig.get = (path) => internalGet(client._botConfig, path);
};

export default async (client) => await Promise.all([
  developerConfig(client),
  frameworkConfig(client)
]);
