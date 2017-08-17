import completeBodyAction = require("./completeBody/completeBody")

/**
 * Initializes remote UI actions
 */
export function intializeActions() {
    completeBodyAction.registerAction();
}