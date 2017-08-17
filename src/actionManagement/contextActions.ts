export var TARGET_RAML_EDITOR_NODE = "TARGET_RAML_EDITOR_NODE"

export var TARGET_RAML_TREE_VIEWER_NODE = "TARGET_RAML_TREE_VIEWER_NODE"

/**
 * Calculates and returns context state, which will be then used
 * for action visibility filtering and later passed to the action onClick callback.
 */
export interface IContextStateCalculator {

    /**
     * Is called to calculate context
     */
    calculate () : any

    /**
     * If present is called before any context calculations are started
     */
    contextCalculationStarted? : () => void;

    /**
     * If present is called after all context calculations are finished
     */
    contextCalculationFinished? : () => void;
}

/**
 * Is called when user activates action. Recieves context state previously calculated by
 * the context state calculator.
 */
export interface IActionItemCallback {
    (contextState? : any, uiState? : any) : void
}

/**
 * Is called to determine whether the current action should be displayed.
 */
export interface IActionVisibilityFilter {
    (contextState? : any) : boolean
}

/**
 * This is the inner interface, action contributors should implement for their actions
 * to add them to the system.
 *
 * Execution steps are the following:
 * 1) stateCalculator is called to calculate the current state.
 * 2) State, calculated by state calculator is passed to visibility filter.
 * 3) If visibility filter accepts the state, onClick is called with the same state.
 */
export interface IContextDependedAction {

    id: string

    /**
     * Displayed menu item name
     */
    name : string

    /**
     * Action target (like editor node, tree viewer etc).
     * The value must be recognizable by action consumers.
     * Some of the standard values are defined in this module.
     */
    target : string

    /**
     * Action category and potential subcategories.
     * In example, item with a name "itemName" and categories ["cat1", "cat2"]
     * will be displayed as the following menu hierarchy: cat1/cat2/itemName
     */
    category? : string[]

    /**
     * Callback called when the action is activated, recieves context state if state calculator
     * is present and returned one
     */
    onClick : IActionItemCallback

    /**
     * Optional label, will be used instead of name for display purpose
     */
    label? : string

    /**
     * Context state calculator, is called before the item is displayed,
     * its results are then passed to shouldDisplay and onClick
     */
    stateCalculator? : IContextStateCalculator

    /**
     * If present is called to determine whether the item should be displayed.
     * Context state is passed as a parameter if
     */
    shouldDisplay? : IActionVisibilityFilter
}

/**
 * Is called when user activates action to display UI.
 * Recieves context state previously calculated by
 * the context state calculator, its output is the user-set state, which is then
 * passed to IActionItemCallback
 */
export interface IStateConvertor {
    /**
     * Method, which input is a context state, and output is the state set by a user.
     * @param contextState
     */
    (contextState? : any) : any;
}


/**
 * Is called when user activates action to display UI.
 * Recieves initial UI state, which is previously converted from context state,
 * or context state directly if no convertor is specified.
 *
 * Returns promise providing final ui state, for action to proceed its execution
 */
export interface IUIDisplay {
    /**
     * Method, which input is an initial ui state.
     * @param initialUIState - initial UI state for UI to operate with.
     * @return promise resolving into the final UI state.
     */
    (initialUIState? : any ) : Promise<any>;
}

/**
 * Is called when user activates action to display UI externally.
 * Should return JS code to execute externally.
 *
 * The code Recieves initial UI state, which is previously converted from context state,
 * or context state directly if no convertor is specified,
 * returns promise providing final ui state, for action to proceed its execution
 *
 */
export interface IExternalUIDisplay {

    /**
     * Creates UI JavaScript code. The code will be evaluated externally,
     * and should accept initial ui state and return final UI state, which will be transferred
     * to the action's onClick
     * @param initialUIState
     */
    createUICode(initialUIState? : any ) : string
}

/**
 * Type guard to differentiate IUIDisplay and IEvaluateUIDisplay instances.
 * @param display
 * @return {boolean}
 */
export function isUIDisplay(display: IUIDisplay | IExternalUIDisplay) : display is IUIDisplay {
    return !isExternalUIDisplay(display);
}

/**
 * Type guard to differentiate IUIDisplay and IEvaluateUIDisplay instances.
 * @param display
 * @return {(initialUIState?:any)=>string}
 */
export function isExternalUIDisplay(display: IUIDisplay | IExternalUIDisplay) : display is IExternalUIDisplay {
    return (<any>display).createUICode && typeof (<any>display).createUICode == "function";
}

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
export interface IContextDependedUIAction extends IContextDependedAction{
    /**
     * Optional convertor from context state to initial UI state.
     * Should be used in client-server environment to provide a JSON object,
     * with will be then sent to a client and used as data to display UI.
     *
     * If not present, displayUI will recieve context state directly.
     */
    initialUIStateConvertor? : IStateConvertor

    /**
     * Should display the UI and return the user state, being then passed to
     * the onClick method along with context state in case of IUIDisplay.
     *
     * In case of IExternalUIDisplay, UI code provided by calling of createUICode is then
     * transferred and executed externally IExternalUIDisplayExecutor.
     *
     * In case of client-server environment this method is responsible to communication,
     * the execution result is often JSON object.
     */
    displayUI : IUIDisplay | IExternalUIDisplay;
}

/**
 * Instanceof for IContextDependedUIAction
 * @param action
 */
export function isUIAction(action : IContextDependedAction) : action is IContextDependedUIAction {
    return (<IContextDependedUIAction>action).displayUI != null;
}

/**
 * Converts external UI display into local UI display synchronized with external display.
 */
export interface IExternalUIDisplayExecutor {
    (externalDisplay : IExternalUIDisplay) : IUIDisplay;
}

/**
 * Actions are being exposed as this outer interface.
 */
export interface IExecutableAction {

    /**
     * Unique action ID.
     */
    id: string

    /**
     * Displayed menu item name
     */
    name : string

    /**
     * Action target (like editor node, tree viewer etc).
     * The value must be recognizable by action consumers.
     * Some of the standard values are defined in this module.
     */
    target : string

    /**
     * Action category and potential subcategories.
     * In example, item with a name "itemName" and categories ["cat1", "cat2"]
     * will be displayed as the following menu hierarchy: cat1/cat2/itemName
     */
    category? : string[]

    /**
     * Callback called when the action is activated.
     */
    onClick : ()=>void

    /**
     * Optional label, will be used instead of name for display purpose
     */
    label? : string
}

/**
 * Range in the document.
 */
export interface ITextEditRange {

    /**
     * Range start position, counting from 0
     */
    start: number

    /**
     * Range end position, counting from 0
     */
    end: number
}

/**
 * Text edit.
 */
export interface ITextEdit {
    /**
     * Range to replace. Range start==end==0 => insert into the beginning of the document,
     * start==end==document end => insert into the end of the document
     */
    range : ITextEditRange,

    /**
     * Text to replace given range with.
     */
    text: string
}

/**
 * Set of text edits for the document
 */
export interface IChangedDocument {
    /**
     * Document URI
     */
    uri: string;

    /**
     * Document content
     */
    text?: string;

    /**
     * Optional set of text edits instead of complete text replacement.
     * Is only taken into account if text is null.
     */
    textEdits? : ITextEdit[];
}

/**
 * Performs document changes.
 */
export interface IDocumentChangeExecutor {

    /**
     * Changes the document.
     * @param change
     * @return promise resolving when the change is executed.
     */
    changeDocument(change: IChangedDocument) : Promise<void>;
}