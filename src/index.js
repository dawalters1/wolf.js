process.on('unhandledRejection', function (error) {
  console.log(`${error.stack}\ninternalErrorMessage: ${error.internalErrorMessage}`);
});
