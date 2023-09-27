import { WOLFAPIError } from '../models/index.js';
import imageSize from 'image-size';
import { fileTypeFromBuffer } from 'file-type';

export default async (config, buffer) => {
  const { mime } = await fileTypeFromBuffer(buffer);

  if (!config.mimes.some((supportedMime) => supportedMime.type === mime)) {
    throw new WOLFAPIError('mimeType is unsupported', mime);
  }

  if (mime.startsWith('image/') && config.square) {
    const size = imageSize(buffer);

    if (size.width !== size.height) {
      throw new WOLFAPIError('image must be square', size);
    }
  }

  const mimeConfig = config.mimes.find((supportedMime) => supportedMime.type === mime);

  if (Buffer.byteLength(buffer) > mimeConfig.size) {
    throw new WOLFAPIError('buffer too large', { allowed: mimeConfig.size, size: Buffer.byteLength(buffer) });
  }

  return true;
};
