export enum MessageType {
  TEXT_PLAIN = 'text/plain',
  TEXT_IMAGE = 'text/image_link',
  TEXT_VOICE = 'text/voice_link',
  TEXT_HTML = 'text/html',
  AUDIO_SPEEX = 'audio/x-speex',
  IMAGE_JPEGHTML = 'image/jpeghtml',

  PM_REQUEST_RESPONSE = 'application/palringo-private-request-response',
  GROUP_ACTION = 'application/palringo-group-action',
  INTERACTIVE_MESSAGE_PACK = 'application/palringo-interactive-message-pack',
}
