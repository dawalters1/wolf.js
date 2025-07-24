import path, { dirname } from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import { JoinLockType, Language, LoginType, OnlineState } from '../constants/index.js';
import _ from 'lodash';
import WOLFAPIError from '../models/WOLFAPIError.js';
import validator from '../validator/index.js';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

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
        throw new WOLFAPIError('non-existant path requested in config', { path, route: path.split('.') });
      }

      return target;
    }, config);
};

const developerConfig = (client) => {
  const config = fs.existsSync(path.join(process.cwd(), '/config/default.yaml')) ? yaml.load(fs.readFileSync(path.join(process.cwd(), '/config/default.yaml'), 'utf-8')) : {};

  client.config = {
    keyword: config?.keyword ?? 'default',
    framework: {
      developer: typeof config?.framework?.developer === 'number' && config.framework.developer ? config.framework.developer : undefined,
      owner: typeof config?.framework?.owner === 'number' && config.framework.owner ? config.framework.owner : undefined,
      language: typeof config?.framework?.language === 'string' && config.framework.language.length === 2 && Object.values(Language).some((language) => client.utility.toLanguageKey(language) === config.framework.language.toLocaleLowerCase()) ? config.framework.language : 'en',
      login: {
        email: typeof config?.framework?.login?.email === 'string' ? config.framework.login.email : undefined,
        password: typeof config?.framework?.login?.password === 'string' ? config.framework.login.password : undefined,
        onlineState: typeof config?.framework?.login?.onlineState === 'number' && Object.values(OnlineState).includes(config.framework.login.onlineState) ? config.framework.login.onlineState : OnlineState.ONLINE,
        token: typeof config?.framework?.login?.token === 'string' ? config.framework.login.token : `WJS${nanoid(32)}`,
        type: typeof config?.framework?.login?.type === 'string' && Object.values(LoginType).includes(config.framework.login.type) ? config.framework.login.type : LoginType.EMAIL,
        apiKey: typeof config?.framework?.login?.apiKey === 'string'? config.framework.login.apiKey : undefined,
      },
      join: {
        limit: typeof config?.framework?.join?.limit === 'number' ? config.framework.join.limit : Infinity,
        lock: typeof config?.framework?.join?.lock === 'number' && Object.values(JoinLockType).includes(config.framework.join.lock) ? config.framework.join.lock : JoinLockType.DEVELOPER,
        members: {
          min: typeof config?.framework?.join?.members?.min === 'number' && config.framework.join.members.min > 0 ? config.framework.join.members.min : 0,
          max: typeof config?.framework?.join?.members?.max === 'number' && config.framework.join.members.max > (config?.framework?.join?.members?.min ?? 0) ? config.framework.join.members.max : Infinity
        }
      },
      commands: {
        ignore: {
          official: typeof config?.framework?.commands?.ignore?.official === 'boolean' ? config.framework.commands.ignore.official : false,
          unofficial: typeof config?.framework?.commands?.ignore?.unofficial === 'boolean' ? config.framework.commands.ignore.unofficial : false,
          self: typeof config?.framework?.commands?.ignore?.self === 'boolean' ? config.framework.commands.ignore.self : true
        },
        rys: typeof config?.framework?.commands?.rys === 'string' && ['enabled', 'disabled'].includes(config.framework.commands.rys) ? config?.framework?.commands?.rys : 'enabled'
      },
      messages: {
        ignore: {
          self: typeof config?.framework?.messages?.ignore?.self === 'boolean' ? config.framework.messages.ignore.self : true
        }
      },
      subscriptions: {
        messages: {
          group: {
            enabled: typeof config?.framework?.subscriptions?.messages?.group?.enabled === 'boolean' || typeof config?.framework?.subscriptions?.messages?.channel?.enabled === 'boolean' ? config.framework.subscriptions.messages.group?.enabled ?? config.framework.subscriptions.messages.channel.enabled : true,
            tipping: typeof config?.framework?.subscriptions?.messages?.group?.tipping === 'boolean' || typeof config?.framework?.subscriptions?.messages?.channel?.tipping === 'boolean' ? config.framework.subscriptions.messages.group?.tipping ?? config.framework.subscriptions.messages.channel.tipping : true
          },
          channel: {
            enabled: typeof config?.framework?.subscriptions?.messages?.group?.enabled === 'boolean' || typeof config?.framework?.subscriptions?.messages?.channel?.enabled === 'boolean' ? config.framework.subscriptions.messages.group?.enabled ?? config.framework.subscriptions.messages.channel.enabled : true,
            tipping: typeof config?.framework?.subscriptions?.messages?.group?.tipping === 'boolean' || typeof config?.framework?.subscriptions?.messages?.channel?.tipping === 'boolean' ? config.framework.subscriptions.messages.group?.tipping ?? config.framework.subscriptions.messages.channel.tipping : true
          },
          private: {
            enabled: typeof config?.framework?.subscriptions?.messages?.private?.enabled === 'boolean' ? config.framework.subscriptions.messages.private.enabled : true,
            tipping: typeof config?.framework?.subscriptions?.messages?.private?.tipping === 'boolean' ? config.framework.subscriptions.messages.private.tipping : false
          }
        }
      },
      rateLimiter: {
        enabled: typeof config?.framework?.rateLimiter?.enabled === 'boolean' ? config.framework.rateLimiter.enabled : false
      },
      beStalky: typeof config?.framework?.beStalky === 'boolean' ? config.framework.beStalky : false
    },
    ..._.omit(config, ['keyword', 'framework']) // Load reamining developer config
  };

  client.config.get = (path) => internalGet(client.config, path);
};

const frameworkConfig = (client) => {
  client._frameworkConfig = yaml.load(fs.readFileSync(path.join(__dirname, '../../config/default.yaml'), 'utf-8'));

  client._frameworkConfig.get = (path) => internalGet(client._frameworkConfig, path);
};

export default (client) => [
  developerConfig(client),
  frameworkConfig(client)
];
