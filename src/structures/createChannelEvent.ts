
export interface CreateChannelEvent {
  title: string;
  startsAt: Date;
  endsAt: Date;
  shortDescription?: string;
  longDescription?: string;
  // eslint-disable-next-line no-undef
  thumbnail?: Buffer;
  hostedBy?: number;
  category?: number
}

export default CreateChannelEvent;
