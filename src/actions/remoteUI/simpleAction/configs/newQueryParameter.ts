import simpleActions = require("../../simpleActions");
import sharedCalculator = require("../../../../actionManagement/sharedASTStateCalculator")
import stateUtils = require("../../stateUtils");
import parser = require("raml-1-parser");
import hl = parser.hl;

export var config: simpleActions.SimpleActionConfig = {
    name: "Create new Query Parameter",

    category: "Add new...",

    property: "queryParameters",

    getUiCode: () => require("raw-loader!../ui"),

    stateToNode: (generalState: sharedCalculator.IGeneralASTState) => stateUtils.getMethodParent(<hl.IHighLevelNode>generalState.node)
}