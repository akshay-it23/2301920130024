function log(stack, level, packageName, message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `${timestamp} | ${stack} | ${level} | ${packageName} | ${message}`;

  console.log(formattedMessage);

  return formattedMessage;
}

module.exports = log;
module.exports.log = log;
module.exports.default = log;