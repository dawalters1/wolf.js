const Response = require('../../../../models/ResponseObject.js');

module.exports = async (api, body) => {
  if (body.reconnectSeconds <= 0) {
    api.websocket.socket.disconnect();
  }

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
