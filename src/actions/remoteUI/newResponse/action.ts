import contextActions = require("../../../actionManagement/contextActions");
import contextActionsImpl = require("../../../actionManagement/contextActionsImpl");
import sharedCalculator = require("../../../actionManagement/sharedASTStateCalculator");
import externalDisplay = require("../externalDisplay");
import utils = require("../../../actionManagement/utils")
import stateUtils = require("../stateUtils");
import parser = require("raml-1-parser");
import hl=parser.hl;

class StateCalculator extends sharedCalculator.CommonASTStateCalculator {
    calculate(): any {
        var generalState = this.getGeneralState();
        
        if(!generalState){
            return null
        }
        
        return stateUtils.getMethodParent(<hl.IHighLevelNode>generalState.node);
    }
}

var stateCalculator = new StateCalculator();

var action : contextActions.IContextDependedUIAction = {
    id: "Create new Response",
    
    name: "Create new Response",
    
    target: contextActions.TARGET_RAML_EDITOR_NODE,
    
    category: ["Add new..."],

    onClick: (contextState : hl.IHighLevelNode, uiState : any) => {
        var generalState = stateCalculator.getGeneralState();
        
        stateUtils.applyChanges(contextState, uiState, "Create new Response","responses","200");

        var content = contextState.lowLevel().unit().contents();
        
        generalState.editor.setText(utils.cleanEmptyLines(content));
    },
    
    stateCalculator: stateCalculator,
    
    shouldDisplay: state => state ? true : false,
    
    initialUIStateConvertor : modelState => stateUtils.newNode(modelState, "Create new Response","responses","200"),
    
    displayUI: new externalDisplay.DefaultExternalUIDisplay(require.resolve("../externalDisplay"), require("../isPackaged").check() ? require("raw-loader!./ui") : undefined)
}

export function registerAction() {
    contextActionsImpl.addAction(action);
}