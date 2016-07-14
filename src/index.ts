import contextActions = require("./actionManagement/contextActions")
import contextActionsImpl = require("./actionManagement/contextActionsImpl")
import sharedStateCalculator = require("./actionManagement/sharedASTStateCalculator")
import contextMenu = require("./actionManagement/contextMenu")
import contextMenuImpl = require("./actionManagement/contextMenuImpl")
import actionInitializer = require("./actions/actionInitializer")

/**
 * Actions that requires user input (UI).
 */
export import uiActions = require("./actions/uiActions")

/**
 * Actions, which do not require user input and use only the context state.
 */
export import standardActions = require("./actions/standardActions")

/**
 * Reexport of raml-1-parser
 */
export import parser = sharedStateCalculator.parser

/**
 * Calculates and returns context state, which will be then used
 * for action visibility filtering and later passed to the action onClick callback.
 */
export type IContextStateCalculator = contextActions.IContextStateCalculator

/**
 * Is called when user activates action. Recieves context state previously calculated by
 * the context state calculator
 */
export type IActionItemCallback = contextActions.IActionItemCallback

/**
 * Is called to determine whether the current action should be displayed.
 */
export type IActionVisibilityFilter = contextActions.IActionVisibilityFilter

/**
 * This is the inner interface, action contributors should implement for their actions
 * to add them to the system.
 */
export type IContextDependedAction = contextActions.IContextDependedAction

/**
 * Actions are being exposed as this outer interface.
 */
export type IExecutableAction = contextActions.IExecutableAction

/**
 * Is called when user activates action to display UI.
 * Recieves context state previously calculated by
 * the context state calculator, its output is the user-set state, which is then
 * passed to IActionItemCallback
 */
export type IStateConvertor = contextActions.IStateConvertor


/**
 * Is called when user activates action to display UI.
 * Recieves initial UI state, which is previously converted from context state,
 * or context state directly if no convertor is specified.
 *
 * When finished, should call uiFinishedCallback providing final ui state, for action to proceed its execution
 */
export type IUIDisplay = contextActions.IUIDisplay

/**
 * Same as IContextDependedAction, but with UI support.
 *
 * Execution steps are the following:
 * 1) stateCalculator is called to calculate the current context state.
 * 2) State, calculated by state calculator is passed to visibility filter.
 * 3) If visibility filter does not accept the state, executions stops.
 * 4) The context state is converted to initial UI state by calling contextStateToUI, if available
 * 5) Initial UI state (or context state if there is no context->ui convertor) is passed to
 * displayUI.
 * 6) Both context state and the state, returned by displayUI is then passed to onClick (IActionItemCallback).
 */
export type IContextDependedUIAction = contextActions.IContextDependedUIAction

/**
 * RAML editor action target.
 * @type {string}
 */
export var TARGET_RAML_EDITOR_NODE = contextActions.TARGET_RAML_EDITOR_NODE

/**
 * Tree viewer. action target.
 * @type {string}
 */
export var TARGET_RAML_TREE_VIEWER_NODE = contextActions.TARGET_RAML_TREE_VIEWER_NODE

/**
 * Registers an action, which will take part in all engine consumers, like
 * context menu, outline actions and potentially toolbar
 * @param action
 */
export function addAction(action : IContextDependedAction) : void {
    contextActionsImpl.addAction(action)
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
export function addSimpleAction(name : string, category : string[], target : string,
                                onClick : IActionItemCallback,
                                shouldDisplay? : IActionVisibilityFilter) :void {
    contextActionsImpl.addSimpleAction(name, category, target, onClick, shouldDisplay)
}

/**
 * Used by consumers to determine the actions to execute
 */
export function calculateCurrentActions(target : string) : IExecutableAction[] {
    return contextActionsImpl.calculateCurrentActions(target)
}

/**
 * Gets a label of an executable action taking action categories into account.
 * @param action
 * @returns {string}
 */
export function getCategorizedActionLabel(action : IExecutableAction) : string {
    return contextActionsImpl.getCategorizedActionLabel(action)
}

/**
 * Position in text.
 */
export type IPoint = sharedStateCalculator.IPoint

/**
 * Range of positions in text.
 */
export type IRange = sharedStateCalculator.IRange

/**
 * Text editor buffer.
 */
export type IEditorTextBuffer = sharedStateCalculator.IEditorTextBuffer

/**
 * Abstract text editor, able to provide document text buffer and cursor position.
 */
export type IAbstractTextEditor = sharedStateCalculator.IAbstractTextEditor

/**
 * General state of AST of the opened editor
 */
export type IGeneralASTState = sharedStateCalculator.IGeneralASTState

/**
 * Provider, which can return current text editor
 */
export type IEditorProvider = sharedStateCalculator.IEditorProvider

/**
 * Provides current AST state.
 * If set via setASTProvider method, will be used instead of a new AST calculation
 * by parsing the text provided by IEditorProvider.
 */
export type IASTProvider = sharedStateCalculator.IASTProvider

/**
 * Provider for AST modifications.
 */
export type IASTModifier = sharedStateCalculator.IASTModifier

/**
 * Intended for subclassing version of GeneralASTStateCalculator
 * Override calculate() method, use getGeneralState() to obtain current general AST state.
 *
 * The state is calculated once for all sub-instances of the class.
 */
export class CommonASTStateCalculator  implements contextActions.IContextStateCalculator {

    calculate () : any {
        return null
    }

    getGeneralState() : IGeneralASTState {
        return <IGeneralASTState> sharedStateCalculator.generalASTStateCalculator.calculate()
    }

    contextCalculationStarted : () => void = () => {
        sharedStateCalculator.generalASTStateCalculator.contextCalculationStarted()
    }

    contextCalculationFinished : () => void = () => {
        sharedStateCalculator.generalASTStateCalculator.contextCalculationFinished()
    }

    getEditor() : IAbstractTextEditor {
        return sharedStateCalculator.generalASTStateCalculator.getEditor()
    }
}

/**
 * Sets editor provider. This method MUST be called at least once, otherwise
 * it will be impossible to calculate the state and an empty state will be returned.
 * @param editorProvider
 */
export function setEditorProvider(editorProvider : IEditorProvider) {
    sharedStateCalculator.setEditorProvider(editorProvider)
}

/**
 * Sets AST provider.
 * If set, will be used instead of a new AST calculation
 * by parsing the text provided by IEditorProvider.
 */
export function setASTProvider(astProvider : IASTProvider) {
    sharedStateCalculator.setASTProvider(astProvider)
}

/**
 * Sets AST modifier.
 */
export function setASTModifier(astModifier : IASTModifier) {
    sharedStateCalculator.setASTModifier(astModifier)
}

/**
 * Single context menu item.
 */
export type IContextMenuItem = contextMenu.IContextMenuItem

/**
 * Contributes context menu items.
 * Is called before each menu display.
 */
export type IContextMenuContributor = contextMenu.IContextMenuContributor

/**
 * Adds new contributor to the list. All contributors are asked for the menu items
 * before the menu is displayed.
 * @param contributor
 */
export function registerContributor(contributor : IContextMenuContributor) : void {
    contextMenuImpl.registerContributor(contributor)
}

/**
 * Calculates current menu items tree.
 * @returns {ContextMenuItemNode[]}
 */
export function calculateMenuItemsTree() : IContextMenuItem[] {
    return contextMenuImpl.calculateMenuItemsTree()
}

/**
 * Initializes standard (non-UI) actions
 */
export function intializeStandardActions() : void {
    actionInitializer.intializeStandardActions();
}

/**
 * Initializes and registers standard context menu contributor, based on currently available context actions.
 * @param selector - CSS selector, can be null if not used in the display.
 */
export function initializeActionBasedMenu(selector? : string) : void {
    contextMenuImpl.initializeActionBasedMenu(selector);
}