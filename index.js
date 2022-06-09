const WOLF = require('./src/client/WOLF');

const client = new WOLF();

client.on('connected', async () => {
  await new Promise((resolve) => { setTimeout(resolve, 2000); });

  console.log(await client.group.member._getMembersList(2));
});

client.on('rateLimit', (data) => console.log(data));

client.websocket._create();
