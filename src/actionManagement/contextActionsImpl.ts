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
    return (<any>action).displayUI;
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

                getLogger().debugDetail("Model state:" + JSON.stringify(initialUIState),
                    "contextActions", "onClick");

                if (targetAction.initialUIStateConvertor) {
                    initialUIState = targetAction.initialUIStateConvertor(initialUIState);

                    getLogger().debugDetail("Model state converted to initial UI state:" +
                        JSON.stringify(initialUIState),
                        "contextActions", "onClick");
                }

                //then calling UI with original action onClick as a callback
                let display = targetAction.displayUI;

                getLogger().debugDetail("Display found:" + (display?"true":"false"),
                    "contextActions", "onClick");

                if (contextActions.isUIDisplay(display)) {
                    getLogger().debugDetail("Action has local UI display",
                        "contextActions", "onClick");

                    display(initialUIState).then(finalUIState=>{
                        this.originalAction.onClick(this.state, finalUIState)
                    })
                } else if (_externalExecutor && contextActions.isExternalUIDisplay(display)) {
                    getLogger().debugDetail("Action has external UI display and external executor exists",
                        "contextActions", "onClick");

                    let externalDisplay = _externalExecutor(targetAction.id, display);

                    getLogger().debugDetail("External display found:" + (externalDisplay?"true":"false"),
                        "contextActions", "onClick");

                    if (externalDisplay) {
                        externalDisplay(initialUIState).then(finalUIState=>{

                            getLogger().debugDetail("External UI displayed finished its work with state:" +
                                JSON.stringify(finalUIState),
                                "contextActions", "onClick");

                            this.originalAction.onClick(this.state, finalUIState)

                            getLogger().debugDetail("Original onclick call finished",
                                "contextActions", "onClick");
                        })
                    }
                }

            } else {
                getLogger().debugDetail("Action is non-ui",
                    "contextActions", "onClick");

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

    getLogger().debugDetail("Filtering actions", "contextActions", "filterActionsByState");
    getLogger().debugDetail("External executor exists: " + (_externalExecutor?"true":"false"),
        "contextActions", "filterActionsByState");

    try {
        var filteredActions = actionsToFilter.filter(action=>{

            if (contextActions.isUIAction(action)) {

                //if action requires UI, we need to check whether remote UI executor is set up
                //If executor is not set, we only provide actions, which UI can be executed locally.
                //If executor is set, we provide actions, which can be executed remotelly
                const result = (_externalExecutor && contextActions.isExternalUIDisplay(action.displayUI))
                    || (!_externalExecutor && contextActions.isUIDisplay(action.displayUI));

                getLogger().debugDetail("UI action " + action.id + " "
                    + (result?"passed":"rejected"), "contextActions", "filterActionsByState");
                return result;

            } else {
                getLogger().debugDetail("Non-UI action " + action.id + " "
                    + "passed", "contextActions", "filterActionsByState");

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
                        return;
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

    getLogger().debugDetail("Returning: [" + result.map(action=>action.id).join(",") + "]",
        "contextActions", "filterActionsByState");

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

    getLogger().debugDetail("Finding action " + actionId, "contextActions", "findActionById");

    try {
        var filteredActions = actions.filter(action => {
            return action.id == actionId
        })

        getLogger().debugDetail("Filtered actions by ID " + (filteredActions?filteredActions.length:0),
            "contextActions", "findActionById");

        result = filterActionsByState(filteredActions);

        getLogger().debugDetail("Filtered actions by state " + (result?result.length:0),
            "contextActions", "findActionById");
    } catch (Error){
        getLogger().error(Error.toString(), "contextActions", "findActionById");
    }

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

    getLogger().debugDetail("Action found: " + (action?"true":"false"),
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
