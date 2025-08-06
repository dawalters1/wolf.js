const Response = require('../../../../models/ResponseObject.js');

module.exports = async (api, body) => {

  api.websocket.socket.reconnectionDelay = data.reconnectSeconds === -1
      ? -1
      : data.reconnectSeconds * 1000;

  return api.emit(
    'loginFailed',
    new Response(
      {
        code: body.code,
        headers: {
          subCode: body.subCode,
          message: body.message,
          reconnectSeconds: body.reconnectSeconds
        }
      }
    )
  );
};
