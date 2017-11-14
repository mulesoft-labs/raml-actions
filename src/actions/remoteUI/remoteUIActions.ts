import completeBodyAction = require("./completeBody/completeBody")
import newMethodAction = require("./newMethod/newMethod")
import newResponseAction = require("./newResponse/action")

/**
 * Initializes remote UI actions
 */
export function intializeActions() {
    completeBodyAction.registerAction();
    newMethodAction.registerAction();
    newResponseAction.registerAction();
}