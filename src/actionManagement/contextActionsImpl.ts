import _ = require("underscore")

import contextActions = require("./contextActions")
import loggerModule = require("./logger")

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

let _logger = null;

export function setLogger(logger: loggerModule.ILogger) {

    _logger = logger;
}

/**
 * Returns logger set for the module, or empty logger if nothing is set.
 * @return {any}
 */
export function getLogger() : loggerModule.ILogger {
    if (_logger) return _logger;

    return new loggerModule.EmptyLogger();
}

var _externalExecutor : contextActions.IExternalUIDisplayExecutor = null;

/**
 * Sets default external ui display executor. Must be set before any of IExternalUIDisplay actions
 * can be executed.
 * @param executor
 */
export function setExternalUIDisplayExecutor(executor: contextActions.IExternalUIDisplayExecutor) {
    _externalExecutor = executor;
}

var _documentChangeExecutor: contextActions.IDocumentChangeExecutor = null;

/**
 * Sets default external ui display executor. Must be set before any of IExternalUIDisplay actions
 * can be executed.
 * @param executor
 */
export function setDocumentChangeExecutor(executor: contextActions.IDocumentChangeExecutor) {
    _documentChangeExecutor = executor;
}

/**
 * Sets default external ui display executor. Must be set before any of IExternalUIDisplay actions
 * can be executed.
 * @param executor
 */
export function getDocumentChangeExecutor(executor: contextActions.IDocumentChangeExecutor) {
    _documentChangeExecutor = executor;
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
        id: name,
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

    id: string

    name : string

    category : string[]

    label : string

    target : string

    state : any

    originalAction : contextActions.IContextDependedAction

    hasUI : boolean;

    onClick : ()=>void


    constructor(targetAction : contextActions.IContextDependedAction, state : any) {

        this.id = targetAction.id;

        this.name = targetAction.name

        this.category = targetAction.category

        this.label = targetAction.label

        this.target = targetAction.target

        this.state = state

        this.originalAction = targetAction

        this.hasUI = instanceofUIAction(targetAction)

        this.onClick = ()=> {

            if (instanceofUIAction(targetAction)) {

                //for ui actions first looking into context state -> initial ui state conversion
                var initialUIState = this.state;
                if (targetAction.initialUIStateConvertor)
                    initialUIState = targetAction.initialUIStateConvertor(initialUIState);

                //then calling UI with original action onClick as a callback
                let display = targetAction.displayUI;
                if (contextActions.isUIDisplay(display)) {
                    display(initialUIState).then(finalUIState=>{

                        this.originalAction.onClick(this.state, finalUIState)
                    })
                } else if (_externalExecutor && contextActions.isExternalUIDisplay(display)) {
                    let externalDisplay = _externalExecutor(display);
                    if (externalDisplay) {
                        externalDisplay(initialUIState).then(finalUIState=>{

                            this.originalAction.onClick(this.state, finalUIState)
                        })
                    }
                }

            } else {
                //for standard actions simply calling onclick immediatelly
                this.originalAction.onClick(this.state)
            }
        }
    }
}

/**
 * Used by consumers to determine all available actions.
 * Only returns action metadata, actions are not executable due to the absence of
 * context, thus onClick is always null
 */
export function allAvailableActions() : contextActions.IExecutableAction[] {
    return actions ? actions.map(action => {
        return {
            id: action.id,
            name : action.name,
            target : action.target,
            category : action.category,
            onClick : null,
            hasUI : contextActions.isUIAction(action),
            label : action.label
        }
    }) : [];
}

function filterActionsByState(actionsToFilter: contextActions.IContextDependedAction[])
    : contextActions.IExecutableAction[] {

    var result : contextActions.IExecutableAction[] = [];

    try {
        var filteredActions = actionsToFilter.filter(action=>{

            if (contextActions.isUIAction(action)) {

                //if action requires UI, we need to check whether remote UI executor is set up
                //If executor is not set, we only provide actions, which UI can be executed locally.
                //If executor is set, we provide actions, which can be executed remotelly
                return (_externalExecutor && contextActions.isExternalUIDisplay(action.displayUI))
                    || (!_externalExecutor && contextActions.isUIDisplay(action.displayUI));

            } else {
                return true;
            }
        });

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

    return result;
}

/**
 * Used by consumers to determine the actions to execute
 */
export function calculateCurrentActions(target : string) : contextActions.IExecutableAction[] {

    var filteredActions = actions.filter(action => {
        return action.target == target;
    })

    return filterActionsByState(filteredActions);
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
 * Finds executable action by ID.
 * @param actionId
 * @return {any}
 */
export function findActionById(actionId: string) : contextActions.IExecutableAction {
    var result : contextActions.IExecutableAction[] = []

    try {
        var filteredActions = actions.filter(action => {
            return action.id == actionId
        })

        result = filterActionsByState(filteredActions);
    } catch (Error){console.error(Error.message)}

    if (result.length > 0) {
        return result[0];
    }

    return null;
}

/**
 * Executes action by ID.
 * Actions are still being filtered by the context, so no invalid actions will be executed.
 *
 * If several actions matches by ID, any one will be executed.
 *
 * @param actionId
 */
export function executeAction(actionId: string) : void {

    getLogger().debug("Executing action " + actionId, "contextActions", "executeAction");
    let action = findActionById(actionId);

    getLogger().debugDetail("Action found: " + action?"true":"false",
        "contextActions", "executeAction");

    if (action) {
        action.onClick();
    }

    getLogger().debugDetail("Finished executing action: " + actionId,
        "contextActions", "executeAction");
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
