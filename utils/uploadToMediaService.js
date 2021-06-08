
const MultiMediaService = require('@dawalters1/wolf.js.mms');
const routes = require('@dawalters1/wolf.js.mms/constants/routes');
const validator = require('@dawalters1/validator');
const imageSize = require('image-size');
const { messageType } = require('@dawalters1/constants');
const {
  v4: uuidv4
} = require('uuid');

const allowedMimeTypes = {
  TEXT_PLAIN: 'text/plain',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_GIF: 'image/gif'
};

module.exports = async (bot, route, content, mimeType, targetId = undefined, isGroup = false) => {
  try{
  if (route === routes.GROUP_AVATAR_UPLOAD || route === routes.EVENT_IMAGE) {
    if (!validator.isValidNumber(targetId)) {
      throw new Error('targetId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetId)) {
      throw new Error('targetId cannot be less than or equal to 0');
    }
  }

  if (!Buffer.isBuffer(content)) {
    throw new Error('content must be a buffer');
  }

  if (route !== routes.MESSAGE_SEND && mimeType !== messageType.IMAGE_JPEG) {
    throw new Error('content mimeType must be image/jpeg');
  } else if (!Object.values(allowedMimeTypes).includes(mimeType)) {
    throw new Error(`content mimeType must be ${Object.values(allowedMimeTypes).join(', ')}`);
  }

  if (route !== routes.MESSAGE_SEND) {
    const size = imageSize(content);

    if (size.width !== size.height) {
      throw new Error('image must be square');
    }
  }
  const body = {
    data: content.toString('base64'),
    mimeType
  };

  if (route === routes.MESSAGE_SEND) {
    body.source = bot.currentSubscriber.id;
    body.recipient = targetId;
    body.isGroup = isGroup;
    body.flightId = uuidv4();
  } else if (route === routes.GROUP_AVATAR_UPLOAD) {
    body.groupId = targetId;
  }

  return await new MultiMediaService(bot).request('POST', route, body);
} catch (error) {
  error.method = `Utils/uploadToMediaService(route = ${JSON.stringify(route)}, content =${JSON.stringify('not displaying')}, mimeType = ${JSON.stringify(mimeType)}, targetId = ${JSON.stringify(targetId)}, isGroup = ${JSON.stringify(isGroup)})`;
  throw error;
}
};
