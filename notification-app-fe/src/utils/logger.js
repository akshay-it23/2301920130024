import { log } from "../../../logging-middleware/browser.js";

export function logEvent(stack, level, packageName, message) {
  return log(stack, level, packageName, message);
}

export default logEvent;