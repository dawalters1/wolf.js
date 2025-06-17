
export type CreateChannelEvent = {
  title: string;
  startsAt: Date;
  endsAt: Date;
  shortDescription?: string;
  longDescription?: string;

  thumbnail?: Buffer;
  hostedBy?: number;
  category?: number
}

export default CreateChannelEvent;
