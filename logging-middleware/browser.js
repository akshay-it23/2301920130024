export function log(stack, level, packageName, message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `${timestamp} | ${stack} | ${level} | ${packageName} | ${message}`;

  console.log(formattedMessage);

  return formattedMessage;
}

export default log;