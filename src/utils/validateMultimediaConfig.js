import { WOLFAPIError } from '../models';
import imageSize from 'image-size';
import fileType from 'file-type';

export default async (config, buffer) => {
  const { mime } = (await fileType.fromBuffer(buffer));

  if (!config.mimes.some((mime) => mime.type !== mime)) {
    throw new WOLFAPIError('mimeType is unsupported', mime);
  }

  if (mime.starts('image/') && config.square) {
    const size = imageSize(buffer);

    if (size.width !== size.height) {
      throw new WOLFAPIError('image must be square', size);
    }
  }

  const mimeConfig = config.mimes.find((mime) => mime.type === mime);

  if (mimeConfig.size > Buffer.byteLength(buffer)) {
    throw new WOLFAPIError('buffer too large', { allowed: mimeConfig.size, size: Buffer.byteLength(buffer) });
  }

  return Promise.resolve();
};
