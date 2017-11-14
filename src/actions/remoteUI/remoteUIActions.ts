import completeBodyAction = require("./completeBody/completeBody")
import newMethodAction = require("./newMethod/newMethod")
import simpleAction = require("./simpleAction/action")

import newBody = require("./simpleAction/configs/newBody")
import newHeader = require("./simpleAction/configs/newHeader")
import newProperty = require("./simpleAction/configs/newProperty")
import newQueryParameter = require("./simpleAction/configs/newQueryParameter")
import newResponse = require("./simpleAction/configs/newResponse")
import newResponseBody = require("./simpleAction/configs/newResponseBody")
import newResponseHeader = require("./simpleAction/configs/newResponseHeader")
import newUriParameter = require("./simpleAction/configs/newUriParameter")

/**
 * Initializes remote UI actions
 */
export function intializeActions() {
    completeBodyAction.registerAction();
    newMethodAction.registerAction();
    
    simpleAction.registerAction(newBody.config);
    simpleAction.registerAction(newHeader.config);
    simpleAction.registerAction(newProperty.config);
    simpleAction.registerAction(newQueryParameter.config);
    simpleAction.registerAction(newResponse.config);
    simpleAction.registerAction(newResponseBody.config);
    simpleAction.registerAction(newResponseHeader.config);
    simpleAction.registerAction(newUriParameter.config);
}