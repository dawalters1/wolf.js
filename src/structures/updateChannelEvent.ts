
export type UpdateChannelEvent = {
  title: string;
  startsAt: Date;
  endsAt: Date;
  shortDescription: string | null;
  longDescription: string | null;

  thumbnail?: Buffer;
  hostedBy: number | null;
  category: number
}

export default UpdateChannelEvent;
