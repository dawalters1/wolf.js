import { nanoid } from 'nanoid';
export default (email, password) => `WJS${nanoid(32)}`;
