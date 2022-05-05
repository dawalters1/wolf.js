const WOLF = require('./src/client/WOLF');
const client = new WOLF();

(async () => {
  console.log(await client.group.event.getByIds([1, 2, 3, 34, 5, 43]));
})();
