<div align="center">
  <br />
  <p>
    <img src = https://i.imgur.com/Rrylen8.png/>
  <p>
    <a href="https://wolf.live/unofficial+bots"><img src="https://img.shields.io/badge/WOLF-Chat-blue" alt="WOLF Chat" /></a>
   <a href="https://www.npmjs.com/package/@dawalters1/wolf.js"><img src="https://img.shields.io/npm/v/@dawalters1/wolf.js.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/@dawalters1/wolf.js"><img src="https://img.shields.io/npm/dt/@dawalters1/wolf.js.svg?maxAge=3600" alt="NPM downloads" /></a>
 
  </p>
  <p>
    <a href="https://nodei.co/npm/@dawalters1/wolf.js/"><img src="https://nodei.co/npm/@dawalters1/wolf.js.png?downloads=true&stars=true" alt="NPM info" /></a>
  </p>
</div>

## Introduction

WOLF.js is a community maintained javascript library used to create Unofficial Bots

## Required

- [Node Version: 12+](https://nodejs.org/en/download/)
- [Visual Code](https://code.visualstudio.com/download)
- [WOLF.js](https://www.npmjs.com/package/@dawalters1/wolf.js) - npm i @dawalters1/wolf.js

#### Optional Packages

- [constants](https://www.npmjs.com/package/@dawalters1/constants) - npm i @dawalters1/constants
- [ioredis](https://www.npmjs.com/package/ioredis) npm i ioredis
  - Requires a local or remote redis server
    - [Windows](https://github.com/tporadowski/redis/releases/tag/v5.0.10) - Github maintained port, because its no longer supported on windows
    - [Linux](https://redis.io/download)

## Getting Started 

- Create a new repo using the following repo [Bot Template](https://github.com/dawalters1/Bot-Template)

#### Config - './config/default.yaml'

```YML
keyword: keyword # single word only
app:
  defaultLanguage: en
  developerId: your_user_id # your user ID
  commandSettings:
    ignoreOfficialBots: true
    ignoreUnofficialBots: false
  networking:
    retryMode: 1 # retry requests on 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout & 408 Timeout
    retryAttempts: 1
    
```
---
#### Phrases - './phrases/en.json'
```JSON
[
    {
        "name": "{keyword}_command_{keyword}",
        "comment":"{keyword} must match the keyword specified in config yaml",
        "value":"!{keyword}"
    },

    {
        "name": "{keyword}_command_help",
        "value":"help"
    },
    {
        "name": "{keyword}_help_message",
        "value":"Welcome to the {botname} bot\n\n!{keyword} help - To display this message\n!{keyword} me - Display basic information about your profile"
    },

    {
        "name": "{keyword}_command_me",
        "value":"me"
    },
    {
        "name": "{keyword}_subscriber_message",
        "value":"Nickname: {nickname} (ID: {id})\nStatus Message: {status}\nLevel: {level} ({percentage}% completed)"
    }
]
```
---
#### index.js
```JS

const WOLF = require('@dawalters1/wolf.js');
const api = new WOLF.WOLFBot();

const me = require('./src/me')

const keyword = api.options.keyword;

api.commandHandler().register([
  new WOLF.Command(`${keyword}_command_${keyword}`, { both: async (command) => api.messaging().sendMessage(command, api.phrase().getByLanguageAndName(command.language, `${keyword}_help_message`)) },
  [
      new WOLF.Command(`${keyword}_command_help`, { both: (command) => api.messaging().sendMessage(command, api.phrase().getByLanguageAndName(command.language, `${keyword}_help_message`)) }),
      new WOLF.Command(`${keyword}_command_me`, { both: (command) => me(api, command) })
  ])
]);

api.on.groupMessage(async(message)=>{
  if(message.body === '!ping'){
    return await api.messaging().sendGroupMessage(message.targetGroupId, 'Pong!');
  }
});

api.on.privateMessage(async(message)=>{
  if(message.isCommand){
    return Promise.resolve();
  }

  const { language } = await api.subscriber().getById(message.sourceSubscriberId);

  return await api.messaging().sendPrivateMessage(message.sourceSubscriberId, api.phrase().getByLanguageAndName(language, `${api.options.keyword}_help_message`));
});

api.on.ready(()=>{
  console.log('Ready');
});

api.login('email', 'password');

```
##### Command - './src/me/index.js'
---
```JS

module.exports = async (api, command) => {

  const subscriber = await api.subscriber().getById(command.sourceSubscriberId);

  return await api.messaging().sendMessage(
    command,
    api.utility().string().replace(api.phrase().getByLanguageAndName(command.language, `${api.options.keyword}_subscriber_message`), 
    {
      nickname: subscriber.nickname,
      id: subscriber.id,
      status: subscriber.status,
      level: subscriber.reputation.split('.')[0],
      percentage: subscriber.reputation.split('.')[1], // you may have to pad left with 0s
  }));
};

```

## Approval

Bots _**MUST**_ be approved by WOLF staff in [bot approval](http://wolflive.com/bot+approval?r=80280172) or [bot approval.ar](http://wolflive.com/bot+approval.ar?r=80280172)

## Known Issues

- Nothing at all ᴺᵒᵗʰᶦⁿᵍ ᵃᵗ ᵃˡˡ

## Lacking Features

- Stage Volume Control 

## Contact

- You can receive help in [unofficial bots](https://wolf.live/unofficial+bots)
