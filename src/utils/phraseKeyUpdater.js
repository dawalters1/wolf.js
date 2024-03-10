import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdef', 45);

(() => {
  const frameworkConfig = yaml.load(fs.readFileSync(path.join(process.cwd(), '/config/default.yaml'), 'utf-8'));

  const newKey = nanoid(42);
  const oldKey = frameworkConfig.commandKey;

  frameworkConfig.commandKey = newKey;

  fs.writeFileSync(path.join(process.cwd(), '/config/default.yaml'), yaml.dump(frameworkConfig));

  const files = fs.readdirSync(path.join(process.cwd(), '/phrases')).filter((file) => file.endsWith('.json'));

  for (const file of files) {
    const phrases = JSON.parse(fs.readFileSync(path.join(process.cwd(), `/phrases/${file}`), 'utf8'));

    phrases.filter((phrase) => phrase.name.startsWith(`{keyword}_${oldKey}`) || phrase.name.startsWith(`{keyword}_command_${oldKey}`))
      .forEach((phrase) => {
        phrase.name = phrase.name.startsWith(`{keyword}_command_${oldKey}`)
          ? phrase.name.replace(`{keyword}_command_${oldKey}`, `{keyword}_command_${newKey}`)
          : phrase.name.replace(`{keyword}_${oldKey}`, `{keyword}_${newKey}`);
      }
      );

    fs.writeFileSync(path.join(process.cwd(), `/phrases/${file}`), JSON.stringify(phrases, null, 4), 'utf-8');
  }

  console.log(`Completed\nOld Key: ${oldKey}\nNew Key: ${newKey}`);
})();
