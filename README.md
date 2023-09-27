<div align="center">
    <br />
    <p>
        <img src= https://i.imgur.com/pd30mGu.png/>
        <p>
            <a href="https://wolf.live/wolf.js"><img src="https://img.shields.io/badge/WOLF-Chat-blue" alt="WOLF Chat" /></a>
            <a href="https://www.npmjs.com/package/wolf.js"><img src="https://img.shields.io/npm/v/wolf.js.svg?maxAge=3600" alt="NPM version" /></a>
            <a href="https://www.npmjs.com/package/wolf.js"><img src="https://img.shields.io/npm/dt/wolf.js.svg?maxAge=3600" alt="NPM downloads" /></a>
        </p>
        <p>
            <a href="https://nodei.co/npm/wolf.js/"><img src="https://nodei.co/npm/wolf.js.png?downloads=true&stars=true" alt="NPM info" /></a>
        </p>
</div>

## Introduction

WOLF.js is a community maintained javascript library used to create Unofficial Bots

## Required

- [Node Version](https://nodejs.org/en/download/): 18 +
- [Visual Code](https://code.visualstudio.com/download)
- [WOLF.js](https://www.npmjs.com/package/wolf.js) - npm i wolf.js

#### Optional Packages

- [ioredis](https://www.npmjs.com/package/ioredis) - npm i ioredis
  - Requires a local or remote redis server
    - [Windows](https://github.com/tporadowski/redis/releases/tag/v5.0.10) - Github maintained port
    - [Linux](https://redis.io/download)

## Getting Started

- Create a new repo using the following repo [Bot Template](https://github.com/dawalters1/Bot-Template)

#### Config - './config/default.yaml'

```YML
keyword: keyword # keyword #single word only
framework:
  developer: #your id here
  language: en #default response language here
  login:
    email: # bot email here
    password: # bot password here
    onlineState: 1 # online state here
  command:
    ignore:
      official: true # whether or not an official bot will trigger a command (internal)
      unofficial: true # whether or not an unofficial bot will trigger a command (internal)
      self: true  # whether or not the bot will process its own messages and trigger its own commands (internal)
  message:
    ignore:
      self: true # whether or not the bot will process its own messages (internal)
  subscriptions:
    messages:
      channel:
        enabled: true #subscribe to channel messages  (server)
        tipping: true # subscribe to channel message tip events  (server)
      private:
        enabled: true # subscribe to private messages (server)
        tipping: false  # subscribe to private message tip events  (server) - NOT IMPLEMENTED


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

import { WOLF, Command } from 'wolf.js';
import me from './src/me/index.js';

const client = new WOLF();
const keyword = client.config.keyword;

client.commandHandler.register(
    [
        new Command(`${keyword}_command_${keyword}`, { both: async (command) =>  command.reply(command.getPhrase(`${keyword}_help_message`)) },
            [
                new Command(`${keyword}_command_help`, { both: (command) => command.reply(command.getPhrase(`${keyword}_help_message`)) }),
                new Command(`${keyword}_command_me`, { both: (command) => me(client, command) })
            ]
        )
    ]
);

client.on('channelMessage', async (message) => {
    if (message.body !== '!ping') { return false; };

    return await message.reply('Pong!');
});

client.on('privateMessage', async (message) => {
    if (message.isCommand) { return false; }

    const { language } = await client.subscriber.getById(message.sourceSubscriberId);

    return await message.reply(client.phrase.getByLanguageAndName(language, `${client.config.keyword}_help_message`))
});

client.on('ready', () => {
    console.log('Ready');
});

client.login();

```
---
##### Command - './src/me/index.js'


```JS

/**
 * Required for intellisense to work with client & command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 */
export default async (client, command) => {

    const subscriber = await client.subscriber.getById(command.sourceSubscriberId);

    return await command.reply(
        client.utility.string.replace(
            command.getPhrase(`${client.config.keyword}_subscriber_message`),
            {
                nickname: subscriber.nickname,
                id: subscriber.id,
                status: subscriber.status,
                level: subscriber.reputation.split('.')[0],
                percentage: subscriber.reputation.split('.')[1], // you may have to pad left with 0s
            }
        )
    );
};

```
## Approval

Bots _**MUST**_ be approved by WOLF staff in [bot approval](http://wolflive.com/bot+approval?r=80280172) or [bot approval.ar](http://wolflive.com/bot+approval.ar?r=80280172)

## Known Issues

- Nothing at all ᴺᵒᵗʰᶦⁿᵍ ᵃᵗ ᵃˡˡ

## Lacking Features

- Nothing at all ᴺᵒᵗʰᶦⁿᵍ ᵃᵗ ᵃˡˡ

## Contact

- You can receive help in [unofficial bots](https://wolf.live/unofficial+bots)
