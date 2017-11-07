import contextActions = require("../actionManagement/contextActions")
import contextActionsImpl = require("../actionManagement/contextActionsImpl")
import standardActions = require("./standardActions")
import uiActions = require("./uiActions")
import remoteUIActions = require("./remoteUI/remoteUIActions")

/**
 * Initializes standard (non-UI) actions
 */
export function intializeStandardActions() {
    contextActionsImpl.addAction(standardActions.commentNode)
    contextActionsImpl.addAction(standardActions.deleteNode)
    contextActionsImpl.addAction(standardActions.expandTypeToJSONSchema)
    contextActionsImpl.addAction(standardActions.expandTypeToJSONSchemaDefinition)

    remoteUIActions.intializeActions();
}