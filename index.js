const WOLFBot = require('./src/client/WOLFBot');
const Command = require('./src/command/Command');
const Validator = require('./src/validator');

const ContactObject = require('./src/models/ContactObject');
const GroupEventObject = require('./src/models/GroupEventObject');
const GroupObject = require('./src/models/GroupObject');
const GroupSubscriberObject = require('./src/models/GroupSubscriberObject');
const MessageObject = require('./src/models/MessageObject');
const ResponseObject = require('./src/models/ResponseObject');
const SubscriberObject = require('./src/models/SubscriberObject');

process.on('unhandledRejection', function (error) {
  console.error(`${error.stack}\ninternalErrorMessage: ${error.internalErrorMessage || 'No Error Provided'}`);
});

module.exports = {
  WOLFBot,
  Command,
  Validator,

  ContactObject,
  GroupEventObject,
  GroupObject,
  GroupSubscriberObject,
  MessageObject,
  ResponseObject,
  SubscriberObject
};
