
export interface UpdateChannelEvent {
  title: string;
  startsAt: Date;
  endsAt: Date;
  shortDescription: string | null;
  longDescription: string | null;
  // eslint-disable-next-line no-undef
  thumbnail?: Buffer;
  hostedBy: number | null;
  category: number
}

export default UpdateChannelEvent;
