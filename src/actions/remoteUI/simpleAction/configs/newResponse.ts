import simpleActions = require("../../simpleActions");
import sharedCalculator = require("../../../../actionManagement/sharedASTStateCalculator")
import stateUtils = require("../../stateUtils");
import parser = require("raml-1-parser");
import hl = parser.hl;

export var config: simpleActions.SimpleActionConfig = {
    name: "Create new Response",

    category: "Add new...",

    property: "responses",

    key: "200",

    getUiCode: () => require("raw-loader!../ui"),

    stateToNode: (generalState: sharedCalculator.IGeneralASTState) => stateUtils.getMethodParent(<hl.IHighLevelNode>generalState.node)
}