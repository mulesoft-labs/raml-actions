import contextActions = require("../../actionManagement/contextActions");
import contextActionsImpl = require("../../actionManagement/contextActionsImpl");
import sharedCalculator = require("../../actionManagement/sharedASTStateCalculator");
import externalDisplay = require("./externalDisplay");
import utils = require("../../actionManagement/utils")
import stateUtils = require("./stateUtils");
import parser = require("raml-1-parser");
import hl=parser.hl;

class StateCalculator extends sharedCalculator.CommonASTStateCalculator {
    constructor(private stateToNode: (generalState: sharedCalculator.IGeneralASTState) => hl.IHighLevelNode) {
        super()
    }
    
    calculate(): any {
        var generalState = this.getGeneralState();

        if(!generalState){
            return null
        }
        
        return this.stateToNode(generalState);
    }
}

export interface SimpleActionConfig {
    name: string,
    
    category: string,
    
    property: string,
    
    key?: string,

    stateToNode: (generalState: sharedCalculator.IGeneralASTState) => hl.IHighLevelNode,

    getUiCode: () => string
}

function innerCreateAction(name: string, category: string, property: string, key: string, stateToNode: (generalState: sharedCalculator.IGeneralASTState) => hl.IHighLevelNode, getUiCode: () => string): contextActions.IContextDependedUIAction {
    var stateCalculator: StateCalculator = new StateCalculator(stateToNode);
    
    return {
        id: name,

        name: name,

        target: contextActions.TARGET_RAML_EDITOR_NODE,

        category: [category],

        onClick: (contextState : hl.IHighLevelNode, uiState : any) => {
            if(uiState.canceled) {
                return;
            }
            
            var generalState = stateCalculator.getGeneralState();

            stateUtils.applyChanges(contextState, uiState, name, property, key);

            var content = contextState.lowLevel().unit().contents();

            generalState.editor.setText(utils.cleanEmptyLines(content));
        },

        stateCalculator: stateCalculator,

        shouldDisplay: state => state ? true : false,

        initialUIStateConvertor : modelState => stateUtils.newNode(modelState, name, property, key),

        displayUI: new externalDisplay.DefaultExternalUIDisplay(null, require("./isPackaged").check() ? getUiCode() : undefined)
    }
}

export function createAction(config: SimpleActionConfig) {
    return innerCreateAction(config.name, config.category, config.property, config.key || "key", config.stateToNode, config.getUiCode);
}