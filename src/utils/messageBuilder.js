import validator from '../validator/index.js';
import { nanoid } from 'nanoid';
import { EmbedType } from '../constants/index.js';

const getFormattingData = async (client, message, ads, links) => {
  const data = {
    formatting: {
      groupLinks: await ads.reduce(async (result, ad) => {
        if ((await result).length >= 25) {
          return result;
        }

        (await result).push({
          start: ad.start,
          end: ad.end,
          groupId: (await client.group.getByName(ad.value))?.id
        });

        return result;
      }, []),
      links
    }
  };

  if (!data.formatting.groupLinks.length) {
    Reflect.deleteProperty(data.formatting, 'groupLinks');
  }

  if (!data.formatting.links.length) {
    Reflect.deleteProperty(data.formatting, 'links');
  }

  return Object.values(data.formatting).length ? data : undefined;
};
// (((http|ftp|https|wss|smtp|ws|wolf):\/\/)?(www.)?[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+.*)
const getEmbedData = (client, formatting) => {
  for (const item of [...[formatting?.groupLinks ?? []], ...[formatting?.links ?? []]].flat().filter(Boolean)) {
    if (Reflect.has(item, 'groupId')) {
      if (item.groupId === undefined) {
        continue;
      }

      return {
        type: EmbedType.GROUP_PREVIEW,
        groupId: item.groupId
      };
    }

    if (Reflect.has(item, 'url')) {
      if (item.url.startsWith('wolf://')) {
        continue;
      }

      const metadata = client.metadata(item.url);

      if (!metadata.success || metadata.body.isBlacklisted) {
        continue;
      }

      const preview = {
        type: !metadata.body.title && metadata.body.imageSize ? EmbedType.IMAGE_PREVIEW : EmbedType.LINK_PREVIEW,
        url: client._botConfig.get('validation.links.protocols').some((proto) => item.url.toLowerCase().startsWith(proto)) ? item.url : `http://${item.url}`
      };

      if (preview.type === EmbedType.LINK_PREVIEW && metadata.body.title) {
        preview.title = metadata.body?.title ?? '-';

        preview.body = metadata.body?.description ?? '-';
      }

      return preview;
    }
  }
};
const getAds = (client, message) => client.utility.string.getAds(message);

const getLinks = (client, message) => message.split(/(?!\(.*)[,،\s](?![^[]*?\])/g).filter(Boolean)
  .reduce((result, word, index) => {
    if (validator.isValidUrl(client, word)) {
      const url = client.utility.string.getValidUrl(word).url;

      result.push({
        start: message.indexOf(word, index),
        end: message.indexOf(word, index) + url.length,
        url
      });
    }

    return result;
  }, []);

const buildMessage = async (client, targetId, isGroup, message) => {
  const ads = getAds(client, message);
  const links = getLinks(client, message);
  const formatting = await getFormattingData(client, message, ads, links);
  const embeds = await getEmbedData(client, formatting);

  return {
    recipient: targetId,
    isGroup,
    mimeType: 'text/plain',
    data: Buffer.from(message, 'utf8'),
    flightId: nanoid(32),
    metadata: formatting,
    embeds
  };
};

export default async (client, targetId, isGroup, message, options) => {
  message = options.formatting.alert ? `/alert ${message}` : options.formatting.me ? `/me ${message}` : message;

  if (message.length <= 1000) {
    return [await buildMessage(client, targetId, isGroup, message)];
  }
};
