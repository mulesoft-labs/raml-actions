/// <reference path="../../typings/main.d.ts" />

import _ = require("underscore")

import contextActions = require("./contextActions")

/**
 * Registers an action, which will take part in all engine consumers, like
 * context menu, outline actions and potentially toolbar
 * @param action
 */
export function addAction(action : contextActions.IContextDependedAction) {
    if (_.find(actions, currentAction => {
            return currentAction.name == action.name
        })) {
        return
    }

    actions.push(action)
}

/**
 * Shortcut for adding simple actions. Not recommended, use addAction() instead to
 * provide state calculator.
 *
 * See IContextDependedAction fields for parameter descriptions.
 * @param name
 * @param target
 * @param onClick
 * @param shouldDisplay
 * @param category
 */
export function addSimpleAction(name : string, category : string[],
                                target : string, onClick : contextActions.IActionItemCallback,
                                shouldDisplay? : contextActions.IActionVisibilityFilter)  {
    var newAction : contextActions.IContextDependedAction = {
        name : name,
        target: target,
        onClick : onClick,
        shouldDisplay : shouldDisplay,
        category : category
    }

    addAction(newAction)
}

export function instanceofUIAction(action : contextActions.IContextDependedAction) : action is contextActions.IContextDependedUIAction {
    return (<any>action).displayUI && typeof((<any>action).displayUI) == "function";
}

class ExecutableAction implements contextActions.IExecutableAction {

    name : string

    category : string[]

    label : string

    target : string

    state : any

    originalAction : contextActions.IContextDependedAction

    onClick : ()=>void


    constructor(targetAction : contextActions.IContextDependedAction, state : any) {
        this.name = targetAction.name

        this.category = targetAction.category

        this.label = targetAction.label

        this.target = targetAction.target

        this.state = state

        this.originalAction = targetAction

        this.onClick = ()=> {

            if (instanceofUIAction(targetAction)) {

                //for ui actions first looking into context state -> initial ui state conersion
                var initialUIState = this.state;
                if (targetAction.initialUIStateConvertor)
                    initialUIState = targetAction.initialUIStateConvertor(initialUIState);

                //then calling UI with original action onClick as a callback
                targetAction.displayUI((finalUIState)=>{

                    this.originalAction.onClick(this.state, finalUIState)
                },initialUIState)

            } else {
                //for standard actions simply calling onclick immediatelly
                this.originalAction.onClick(this.state)
            }
        }
    }
}

/**
 * Used by consumers to determine the actions to execute
 */
export function calculateCurrentActions(target : string) : contextActions.IExecutableAction[] {

    var result : contextActions.IExecutableAction[] = []

    try {
        var filteredActions = actions.filter(action => {
            return action.target == target
        })

        filteredActions.forEach(action => {
            if (action.stateCalculator) {
                if (action.stateCalculator.contextCalculationStarted) {
                    try {
                        action.stateCalculator.contextCalculationStarted()
                    } catch (Error){console.error(Error.message)}
                }
            }
        })

        filteredActions.forEach(action => {
            try {
                var state:any = null;
                if (action.stateCalculator) {
                    state = action.stateCalculator.calculate();
                }

                if (action.shouldDisplay) {
                    if (!action.shouldDisplay(state)) {
                        return
                    }
                }

                result.push(new ExecutableAction(action, state))
            } catch (Error){console.error(Error.message)}
        })

        filteredActions.forEach(action => {
            if (action.stateCalculator) {
                if (action.stateCalculator.contextCalculationFinished) {
                    try {
                        action.stateCalculator.contextCalculationFinished()
                    } catch (Error){console.error(Error.message)}
                }
            }
        })
    } catch (Error){console.error(Error.message)}

    return result
}


/**
 * Gets a label of an executable action taking action categories into account.
 * @param action
 * @returns {string}
 */
export function getCategorizedActionLabel(action : contextActions.IExecutableAction) : string {
    if (action.label) {
        return action.label
    }

    var result : string = "api-workbench:"

    if (action.category) {
        action.category.forEach(cat => {
            result = result + cat + ": "
        })
    }

    result = result + action.name

    return result
}

/**
 * Must be called once on module startup
 */
//export function initialize() {
//    if (initialized) {
//        return;
//    }
//
//    initialized = true;
//}


var initialized = false;
var actions : contextActions.IContextDependedAction[] = []
