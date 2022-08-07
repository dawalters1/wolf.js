import { Event } from "../../../../constants/index.js";
import models from "../../../../models/index.js";
export default async (client, body) => {
    return client.emit(body.isGroup ? Event.GROUP_MESSAGE_UPDATE : Event.PRIVATE_MESSAGE_UPDATE, new models.Message(client, body));
};
