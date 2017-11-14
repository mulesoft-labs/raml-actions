import simpleActions = require("../simpleActions");
import contextActionsImpl = require("../../../actionManagement/contextActionsImpl");

export function registerAction(config: simpleActions.SimpleActionConfig) {
    var action = simpleActions.createAction(config);

    contextActionsImpl.addAction(action);
}