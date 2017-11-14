import completeBodyAction = require("./completeBody/completeBody")
import newResponseAction = require("./newResponse/action")

/**
 * Initializes remote UI actions
 */
export function intializeActions() {
    completeBodyAction.registerAction();
    newResponseAction.registerAction();
}