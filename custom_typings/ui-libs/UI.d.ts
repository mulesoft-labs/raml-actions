import tm = require("./treeModel");
export declare type HTMLTypes = HTMLElement;
export interface IDisposable {
    dispose(): any;
}
export declare class CompositeDisposable implements IDisposable {
    private items;
    add(d: IDisposable): void;
    remove(d: IDisposable): void;
    dispose(): void;
}
export interface UIComponent extends IDisposable {
    renderUI(): HTMLTypes;
    parent(): UIComponent | BasicComponent<any>;
    setParent(p: UIComponent): void;
    children(): UIComponent[];
    addChild(ch: UIComponent): void;
    removeChild(ch: UIComponent): void;
    isAttached(): boolean;
    ui(): HTMLTypes;
    caption(): string;
    changed(): void;
    refresh(): void;
}
export interface IListenable<T> {
    addListener(listener: T): any;
    removeListener(listener: T): any;
}
export interface Function<T, R> {
    (x: T): R;
}
export interface AnyFunc<T> extends Function<T, any> {
}
export declare enum StatusCode {
    OK = 0,
    WARNING = 1,
    ERROR = 2,
}
export interface Status {
    code: StatusCode;
    message: string;
}
export interface Validator<T> extends Function<T, Status> {
}
export declare type StatusListener = AnyFunc<Status>;
export interface IBinding extends IListenable<IBindingListener> {
    get(): any;
    set(v: any): any;
    addValidator(v: Validator<any>): any;
    removeValidator(v: Validator<any>): any;
    addStatusListener(s: StatusListener): any;
    removeStatusListener(s: StatusListener): any;
    status(): Status;
    setStatus?(s: Status): any;
}
export interface IBindingListener {
    (newValue: any, oldValue?: any, b?: IBinding): any;
}
export declare class BasicBinding implements IBinding {
    private value;
    private listeners;
    private validators;
    private slisteners;
    private _status;
    addValidator(v: Validator<any>): void;
    removeValidator(v: Validator<any>): void;
    addStatusListener(s: StatusListener): void;
    removeStatusListener(s: StatusListener): void;
    status(): Status;
    setStatus(newStatus: Status): void;
    get(): any;
    constructor(value?: any);
    set(v: any): any;
    addListener(listener: IBindingListener): void;
    removeListener(listener: IBindingListener): void;
}
export declare class BasicComponent<T extends HTMLElement> implements UIComponent, IDisposable {
    private _tagName;
    private _id;
    id(): string;
    setId(id: string): this;
    private _disabled;
    disabled(): boolean;
    setDisabled(disabled: boolean): void;
    private _parent;
    protected _children: UIComponent[];
    protected focusListeners: EventHandler[];
    protected _onAltClickListeners: EventHandler[];
    protected _onKeyUpListeners: EventHandler[];
    protected _onKeyDownListeners: EventHandler[];
    protected _onKeyPressListeners: EventHandler[];
    protected _bListener: IBindingListener;
    setTabIndex(index: number): void;
    protected _binding: IBinding;
    protected createBinding(): BasicBinding;
    protected _extraClasses: string[];
    private _icon;
    private _percentWidth;
    private _percentHeight;
    private _extraStyles;
    padding_right: number;
    padding_left: number;
    margin_right: number;
    margin_left: number;
    margin_top: number;
    margin_bottom: number;
    addFocusListener(e: EventHandler): void;
    removeFocusListener(e: EventHandler): void;
    addAltClickListener(e: EventHandler): void;
    removeAltClickListener(e: EventHandler): void;
    addKeyDownListener(e: EventHandler): void;
    removeKeyDownListener(e: EventHandler): void;
    addKeyUpListener(e: EventHandler): void;
    removeKeyUpListener(e: EventHandler): void;
    addKeyPressListener(e: EventHandler): void;
    removeKeyPressListener(e: EventHandler): void;
    pad(left: number, right: number): BasicComponent<T>;
    margin(left: number, right: number, top?: number, bottom?: number): BasicComponent<T>;
    protected getAssociatedValue(): any;
    private inSet;
    protected setAssociatedValue(v: any): void;
    getStyle(): {
        [name: string]: string;
    };
    private _caption;
    caption(): string;
    setCaption(s: string): BasicComponent<T>;
    setIcon(icon: Icon): void;
    getIcon(): Icon;
    setStyle(s: string, value: string): BasicComponent<T>;
    removeStyle(s: string): void;
    hasClass(className: string): boolean;
    disposable: CompositeDisposable;
    tooltipHandle: IDisposable;
    clearUI(): void;
    private applyTooltip(tooltip);
    tooltipComponent: BasicComponent<any>;
    tooltipComponentListener: ElementChangeListener;
    protected handleDataChanged(): void;
    setTooltip(t: BasicComponent<any>): BasicComponent<T>;
    private disposeTooltipListeners();
    /**
     * may be called multiple times
     */
    dispose(): void;
    wasDisposed: boolean;
    getPercentWidth(): number;
    setPercentWidth(value: number): BasicComponent<T>;
    getPercentHeight(): number;
    setPercentHeight(value: number): BasicComponent<T>;
    private _display;
    setDisplay(display: boolean): void;
    getDisplay(): boolean;
    private _onClickListeners;
    addClass(token: string): this;
    removeClass(token: string): void;
    addOnClickListener(ev: EventHandler): void;
    removeOnClickListener(ev: EventHandler): void;
    protected _ui: T;
    ui(): T;
    refresh(): void;
    constructor(_tagName: any, icon?: Icon);
    setTagName(s: string): void;
    setBinding(b: IBinding): void;
    getBinding(): IBinding;
    private firstInit;
    protected selfInit(): void;
    renderUI(): T;
    private _oldIcon;
    focusPropagator: (x: any) => void;
    destroyListener: (x: any) => void;
    protected customize(element: T): void;
    /**
     *
     * @returns not null element;
     */
    protected selfRender(): T;
    protected selfRenderFooter(): HTMLElement;
    parent(): UIComponent;
    setParent(p: UIComponent): void;
    clear(): void;
    addChild(child: UIComponent, before?: UIComponent, after?: boolean): void;
    removeChild(child: UIComponent): void;
    replaceChild(newChild: UIComponent, oldChild: UIComponent): void;
    componentListeners: ElementChangeListener[];
    addComponentListener(cl: ElementChangeListener): void;
    removeComponentListener(cl: ElementChangeListener): void;
    protected handleLocalChange(): void;
    changed(): void;
    children(): UIComponent[];
    isAttached(): boolean;
}
export interface ElementChangeListener {
    changed(element: BasicComponent<any>): any;
}
export declare class CheckBox extends BasicComponent<HTMLDivElement> implements IField<HTMLDivElement> {
    private _onchange;
    getActualField(): CheckBox;
    setLabelWidth(w: number): void;
    setLabelHeight(h: number): void;
    private _required;
    setRequired(b: boolean): void;
    private value;
    protected handleDataChanged(): void;
    protected selfInit(): void;
    static num: number;
    constructor(caption: string, icon: Icon, _onchange: EventHandler);
    setValue(v: boolean): void;
    getValue(): boolean;
    private actualInput;
    refresh(): void;
}
export declare class RadioButton extends BasicComponent<HTMLDivElement> implements IField<HTMLDivElement> {
    private _rid;
    private _onchange;
    getActualField(): RadioButton;
    setLabelWidth(w: number): void;
    setLabelHeight(h: number): void;
    private _required;
    setRequired(b: boolean): void;
    private value;
    protected handleDataChanged(): void;
    protected selfInit(): void;
    id(): string;
    setId(id: string): this;
    constructor(caption: string, _rid: string, icon: Icon, _onchange: EventHandler);
    setValue(v: boolean): void;
    getValue(): boolean;
    private actualInput;
    refresh(): void;
}
export declare class Select extends BasicComponent<HTMLDivElement> {
    private onChange;
    private _select;
    private _value;
    private _options;
    getOptions(): string[];
    setOptions(options: string[]): void;
    handleLocalChange(): void;
    protected handleDataChanged(): void;
    protected selfInit(): void;
    getValue(): string;
    setValue(vl: string, fire?: boolean): void;
    constructor(caption: string, onChange?: EventHandler, ic?: Icon);
}
export declare class TextElement<T extends HTMLElement> extends BasicComponent<T> {
    getText(): string;
    setText(value: string, handle?: boolean): void;
    handleDataChanged(): void;
    private _text;
    constructor(tag: string, txt?: string | IBinding, icon?: Icon);
    caption(): string;
    protected customize(element: T): void;
}
export declare class InlineHTMLElement extends BasicComponent<HTMLElement> {
    getText(): string;
    setText(value: string): void;
    handleDataChanged(): void;
    private _text;
    constructor(tag: string, txt?: string, icon?: Icon);
    protected customize(element: HTMLElement): void;
}
export declare class Label extends TextElement<HTMLSpanElement> {
    constructor(txt?: string, icon?: Icon);
}
export interface EventHandler {
    (c?: BasicComponent<any>, event?: any): any;
}
export declare class Panel extends BasicComponent<HTMLDivElement> {
    private _layoutType;
    constructor(_layoutType?: LayoutType);
    addChild(child: UIComponent, before?: UIComponent): void;
    renderUI(align?: boolean): HTMLDivElement;
}
export declare class WrapPanel extends Panel {
    setLabelWidth(n: number): void;
    setLabelHeight(n: number): void;
}
export declare enum ButtonSizes {
    NORMAL = 0,
    EXTRA_SMALL = 1,
    SMALL = 2,
    LARGE = 3,
}
export declare enum ButtonHighlights {
    NO_HIGHLIGHT = 0,
    PRIMARY = 1,
    INFO = 2,
    SUCCESS = 3,
    WARNING = 4,
    ERROR = 5,
}
export declare enum TextClasses {
    NORMAL = 0,
    SMALLER = 1,
    SUBTLE = 2,
    HIGHLIGHT = 3,
    INFO = 4,
    SUCCESS = 5,
    WARNING = 6,
    ERROR = 7,
}
export declare enum HighLightClasses {
    NONE = 0,
    HIGHLIGHT = 1,
    HIGHLIGHT_INFO = 2,
    HIGHLIGHT_SUCCESS = 3,
    HIGHLIGHT_WARNING = 4,
    HIGHLIGHT_ERROR = 5,
}
export declare enum LayoutType {
    BLOCK = 0,
    INLINE_BLOCK = 1,
    INLINE_BLOCK_TIGHT = 2,
    BTN_GROUP = 3,
}
export declare enum Icon {
    NONE = 0,
    ALERT = 1,
    ALIGNMENT_ALIGN = 2,
    ALIGNMENT_ALIGNED_TO = 3,
    ALIGNMENT_UNALIGN = 4,
    ARROW_DOWN = 5,
    ARROW_LEFT = 6,
    ARROW_RIGHT = 7,
    ARROW_SMALL_DOWN = 8,
    ARROW_SMALL_LEFT = 9,
    ARROW_SMALL_RIGHT = 10,
    ARROW_SMALL_UP = 11,
    ARROW_UP = 12,
    BEER = 13,
    BOOK = 14,
    BOOKMARK = 15,
    BRIEFCASE = 16,
    BROADCAST = 17,
    BROWSER = 18,
    BUG = 19,
    CALENDAR = 20,
    CHECK = 21,
    CHECKLIST = 22,
    CHEVRON_DOWN = 23,
    CHEVRON_LEFT = 24,
    CHEVRON_RIGHT = 25,
    CHEVRON_UP = 26,
    CIRCLE_SLASH = 27,
    CIRCUIT_BOARD = 28,
    CLIPPY = 29,
    CLOCK = 30,
    CLOUD_DOWNLOAD = 31,
    CLOUD_UPLOAD = 32,
    CODE = 33,
    COLOR_MODE = 34,
    COMMENT_ADD = 35,
    COMMENT = 36,
    COMMENT_DISCUSSION = 37,
    CREDIT_CARD = 38,
    DASH = 39,
    DASHBOARD = 40,
    DATABASE = 41,
    DEVICE_CAMERA = 42,
    DEVICE_CAMERA_VIDEO = 43,
    DEVICE_DESKTOP = 44,
    DEVICE_MOBILE = 45,
    DIFF = 46,
    DIFF_ADDED = 47,
    DIFF_IGNORED = 48,
    DIFF_MODIFIED = 49,
    DIFF_REMOVED = 50,
    DIFF_RENAMED = 51,
    ELLIPSIS = 52,
    EYE_UNWATCH = 53,
    EYE_WATCH = 54,
    EYE = 55,
    FILE_BINARY = 56,
    FILE_CODE = 57,
    FILE_DIRECTORY = 58,
    FILE_MEDIA = 59,
    FILE_PDF = 60,
    FILE_SUBMODULE = 61,
    FILE_SYMLINK_DIRECTORY = 62,
    FILE_SYMLINK_FILE = 63,
    FILE_TEXT = 64,
    FILE_ZIP = 65,
    FLAME = 66,
    FOLD = 67,
    GEAR = 68,
    GIFT = 69,
    GIST = 70,
    GIST_SECRET = 71,
    GIT_BRANCH_CREATE = 72,
    GIT_BRANCH_DELETE = 73,
    GIT_BRANCH = 74,
    GIT_COMMIT = 75,
    GIT_COMPARE = 76,
    GIT_MERGE = 77,
    GIT_PULL_REQUEST_ABANDONED = 78,
    GIT_PULL_REQUEST = 79,
    GLOBE = 80,
    GRAPH = 81,
    HEART = 82,
    HISTORY = 83,
    HOME = 84,
    HORIZONTAL_RULE = 85,
    HOURGLASS = 86,
    HUBOT = 87,
    INBOX = 88,
    INFO = 89,
    ISSUE_CLOSED = 90,
    ISSUE_OPENED = 91,
    ISSUE_REOPENED = 92,
    JERSEY = 93,
    JUMP_DOWN = 94,
    JUMP_LEFT = 95,
    JUMP_RIGHT = 96,
    JUMP_UP = 97,
    KEY = 98,
    KEYBOARD = 99,
    LAW = 100,
    LIGHT_BULB = 101,
    LINK = 102,
    LINK_EXTERNAL = 103,
    LIST_ORDERED = 104,
    LIST_UNORDERED = 105,
    LOCATION = 106,
    GIST_PRIVATE = 107,
    MIRROR_PRIVATE = 108,
    GIT_FORK_PRIVATE = 109,
    LOCK = 110,
    LOGO_GITHUB = 111,
    MAIL = 112,
    MAIL_READ = 113,
    MAIL_REPLY = 114,
    MARK_GITHUB = 115,
    MARKDOWN = 116,
    MEGAPHONE = 117,
    MENTION = 118,
    MICROSCOPE = 119,
    MILESTONE = 120,
    MIRROR_PUBLIC = 121,
    MIRROR = 122,
    MORTAR_BOARD = 123,
    MOVE_DOWN = 124,
    MOVE_LEFT = 125,
    MOVE_RIGHT = 126,
    MOVE_UP = 127,
    MUTE = 128,
    NO_NEWLINE = 129,
    OCTOFACE = 130,
    ORGANIZATION = 131,
    PACKAGE = 132,
    PAINTCAN = 133,
    PENCIL = 134,
    PERSON_ADD = 135,
    PERSON_FOLLOW = 136,
    PERSON = 137,
    PIN = 138,
    PLAYBACK_FAST_FORWARD = 139,
    PLAYBACK_PAUSE = 140,
    PLAYBACK_PLAY = 141,
    PLAYBACK_REWIND = 142,
    PLUG = 143,
    REPO_CREATE = 144,
    GIST_NEW = 145,
    FILE_DIRECTORY_CREATE = 146,
    FILE_ADD = 147,
    PLUS = 148,
    PODIUM = 149,
    PRIMITIVE_DOT = 150,
    PRIMITIVE_SQUARE = 151,
    PULSE = 152,
    PUZZLE = 153,
    QUESTION = 154,
    QUOTE = 155,
    RADIO_TOWER = 156,
    REPO_DELETE = 157,
    REPO = 158,
    REPO_CLONE = 159,
    REPO_FORCE_PUSH = 160,
    GIST_FORK = 161,
    REPO_FORKED = 162,
    REPO_PULL = 163,
    REPO_PUSH = 164,
    ROCKET = 165,
    RSS = 166,
    RUBY = 167,
    SCREEN_FULL = 168,
    SCREEN_NORMAL = 169,
    SEARCH_SAVE = 170,
    SEARCH = 171,
    SERVER = 172,
    SETTINGS = 173,
    LOG_IN = 174,
    SIGN_IN = 175,
    LOG_OUT = 176,
    SIGN_OUT = 177,
    SPLIT = 178,
    SQUIRREL = 179,
    STAR_ADD = 180,
    STAR_DELETE = 181,
    STAR = 182,
    STEPS = 183,
    STOP = 184,
    REPO_SYNC = 185,
    SYNC = 186,
    TAG_REMOVE = 187,
    TAG_ADD = 188,
    TAG = 189,
    TELESCOPE = 190,
    TERMINAL = 191,
    THREE_BARS = 192,
    THUMBSDOWN = 193,
    THUMBSUP = 194,
    TOOLS = 195,
    TRASHCAN = 196,
    TRIANGLE_DOWN = 197,
    TRIANGLE_LEFT = 198,
    TRIANGLE_RIGHT = 199,
    TRIANGLE_UP = 200,
    UNFOLD = 201,
    UNMUTE = 202,
    VERSIONS = 203,
    REMOVE_CLOSE = 204,
    X = 205,
    ZAP = 206,
}
export declare function iconToClass(icon: Icon): string;
export declare class Button extends BasicComponent<HTMLButtonElement> {
    private _size;
    protected _highlight: ButtonHighlights;
    private static sizeString(buttonSize);
    private static highlightString(highlight);
    constructor(content: string, _size?: ButtonSizes, _highlight?: ButtonHighlights, _icon?: Icon, onClick?: EventHandler);
    getText(): string;
    setText(value: string): void;
    handleDataChanged(): void;
    private _text;
    private _oldHighlightClass;
    private _oldSizeClass;
    protected customize(element: HTMLButtonElement): void;
}
export declare class ToggleButton extends Button {
    private _selected;
    getSelected(): boolean;
    handleDataChanged(): void;
    setSelected(selected: boolean): ToggleButton;
    toggle(): void;
    private _defaultHighlight;
    constructor(content: string, size: ButtonSizes, highlight: ButtonHighlights, icon: Icon, onClick: EventHandler);
}
export interface WidgetCreator<T> {
    (model: T): BasicComponent<any>;
}
export interface ICellRenderer<T> {
    render(model: T): BasicComponent<any>;
}
export declare class SimpleRenderer<T> implements ICellRenderer<T> {
    private _renderFunc;
    constructor(_renderFunc: WidgetCreator<T>);
    render(model: T): BasicComponent<any>;
}
export interface ListenableCellRenderer<T> extends ICellRenderer<T>, IListenable<EventHandler> {
}
export interface IStructuredContentProvider<M, T> {
    elements(model: M): T[];
    init(viewer: StructuredViewer<M, T>): any;
    dispose(): any;
}
export interface ITreeContentProvider<M, T> extends IStructuredContentProvider<M, T> {
    hasChildren(element: T): boolean;
    children(element: T): T[];
}
export declare class PropertyChangeEvent {
    source: any;
    value: any;
    property: string;
    constructor(source: any, value?: any, property?: string);
}
export interface PropertyChangeListener {
    (e: PropertyChangeEvent): any;
}
export interface ViewerFilter<T> extends IListenable<PropertyChangeListener> {
    accept(viewer: StructuredViewer<any, T>, value: T, parent: T): boolean;
}
export interface ViewerSorter<T> extends IListenable<PropertyChangeListener> {
    order(viewer: StructuredViewer<any, T>, value: T, parent: T): number;
}
export declare class Viewer<M> extends BasicComponent<HTMLElement> {
    getInput(): M;
    setInput(value: M, refresh?: boolean): void;
    _contentui: BasicComponent<HTMLElement>;
    updateContent(): void;
    smartUpdateContent(): void;
    _children: UIComponent[];
    protected _model: M;
}
export interface SelectionProvider<T> {
    addSelectionListener(l: ISelectionListener<T>): any;
    removeSelectionListener(l: ISelectionListener<any>): any;
    getSelection(): StructuredSelection<T>;
}
export interface SelectionViewer<T> extends SelectionProvider<T>, UIComponent {
}
export declare class StructuredViewer<M, T> extends Viewer<M> implements SelectionViewer<T> {
    private _cp;
    protected renderer: ICellRenderer<T>;
    private selectionListeners;
    protected viewerFilters: ViewerFilter<T>[];
    protected viewerSorter: ViewerSorter<T>;
    protected basicLabelProvider: LabelFunction<T>;
    setBasicLabelFunction(f: LabelFunction<T>): void;
    getBasicLabelFunction(): LabelFunction<T>;
    protected _keyProvider: KeyProvider<T>;
    setKeyProvider(kp: KeyProvider<T>): void;
    getKeyProvider(): KeyProvider<T>;
    protected nodeKey(node: T): any;
    lst: PropertyChangeListener;
    addViewerFilter(filter: ViewerFilter<T>): void;
    removeViewerFilter(filter: ViewerFilter<T>): void;
    getViewerFilters(): ViewerFilter<T>[];
    setViewerSorder(sorter: ViewerSorter<T>): void;
    getViewerSorter(): ViewerSorter<T>;
    addSelectionListener(l: ISelectionListener<T>): void;
    removeSelectionListener(l: ISelectionListener<any>): void;
    protected currentSelection: T[];
    protected currentSelectionIds: any[];
    protected setSelectionInternal(newValue: T[]): void;
    getSelection(): StructuredSelection<T>;
    protected getRenderedContent(p: T): T[];
    protected unfilteredContent(p: T): T[];
    constructor(_cp: IStructuredContentProvider<M, T>, renderer: ICellRenderer<T>);
    private eh;
    protected processChildren(model: T, view: BasicComponent<any>): BasicComponent<any>;
    dispose(): void;
}
export declare class ArrayContentProvider<T> implements IStructuredContentProvider<T[], T> {
    elements(model: T[]): any;
    init(viewer: any): void;
    dispose(): void;
}
export interface LabelFunction<T> {
    (m: T): string;
}
export interface IconFunction<T> {
    (m: T): Icon;
}
export interface Selection {
    isEmpty(): boolean;
}
export declare class StructuredSelection<T> implements Selection {
    elements: T[];
    isEmpty(): boolean;
    constructor(elements: T[] | T);
}
export declare class SelectionChangedEvent<T> {
    source: StructuredViewer<any, T>;
    oldSelection: StructuredSelection<T>;
    selection: StructuredSelection<T>;
    constructor(source: StructuredViewer<any, T>, oldSelection: StructuredSelection<T>, selection: StructuredSelection<T>);
}
export interface ISelectionListener<T> {
    selectionChanged(event: SelectionChangedEvent<T>): any;
}
export declare class LabelRenderer<T> implements ICellRenderer<T> {
    private _label;
    private ic;
    constructor(_label: LabelFunction<T>, ic?: IconFunction<T>);
    render(model: T): BasicComponent<any>;
}
export declare class ListView<M, T> extends StructuredViewer<M, T> {
    private treeModel;
    getTreeModel(): tm.TreeModel<T, BasicComponent<HTMLElement>>;
    setBasicLabelFunction(f: LabelFunction<T>): void;
    clear(): void;
    put(element: T, parent: T, after?: boolean, neighbour?: T): void;
    insertBefore(element: T, parent: T, before?: T): void;
    insertAfter(element: T, parent: T, after?: T): void;
    remove(element: T): void;
    private _cmp;
    setComparator(cmp: (x: T, y: T) => boolean): void;
    getComparator(): (x: T, y: T) => boolean;
    private propagateHashKey(parent, element);
    smartUpdateContent(model?: T): void;
    protected _panelCustomized: boolean;
    customizePanel(forced?: boolean): void;
    private _scrollTo;
    tryScrollToSelected(): void;
    protected _selected: BasicComponent<any>;
    protected handleKey(e: KeyboardEvent): void;
    navigateDown(): void;
    navigateUp(): void;
    private focusPane();
    protected wrapChild(element: T, preview: BasicComponent<any>): BasicComponent<any>;
    setSelection(element: T): boolean;
    private multipleSelect;
    setMultipleSelect(ms: boolean): void;
    isMultipleSelect(): boolean;
    selectedComponents: BasicComponent<any>[];
    protected unselectItem(x: BasicComponent<any>): void;
    protected selectItem(x: BasicComponent<any>): void;
}
export interface ObjectToChildren<T> {
    (obj: T): T[];
}
export declare class DefaultTreeContentProvider<T> implements ITreeContentProvider<T, T> {
    private _objectToChildren;
    hasChildren(element: any): boolean;
    constructor(_objectToChildren: ObjectToChildren<T>);
    children(element: T): T[];
    elements(model: any): any[];
    init(): void;
    dispose(): void;
}
export interface TreePanel<A, T> extends Panel {
    viewer: TreeViewer<A, T>;
}
export declare function listSection<T>(header: string, icon: Icon, input: T[], renderer: ICellRenderer<T>, addFilter?: boolean, lf?: LabelFunction<T>): Panel;
export declare function list<T>(input: T[], renderer: ICellRenderer<T> | WidgetCreator<T>): ListView<T[], T>;
export interface KeyProvider<T> {
    key(node: T): string;
}
export declare class NodeWithKey {
}
export interface HasId {
    id(): string;
}
export declare class TreeViewer<A, T> extends ListView<A, T> {
    private _tcp;
    protected renderer: ICellRenderer<T>;
    getComparator(): (x: any, y: any) => boolean;
    customizePanel(forced?: boolean): void;
    private _chhNum;
    private _expandedNodes;
    isExpanded(node: T): boolean;
    getExpanded(): T[];
    setSelection(element: T): boolean;
    setExpanded(element: T, state: boolean): void;
    protected wrapChild(element: T, preview: BasicComponent<any>): BasicComponent<any>;
    protected unfilteredContent(p: T): T[];
    constructor(_tcp: ITreeContentProvider<A, T>, renderer: ICellRenderer<T>, labelProvider?: LabelFunction<T>);
    tryExpand(): void;
    tryCollapse(): void;
    navigateDown(): void;
    navigateUp(): void;
    protected handleKey(e: KeyboardEvent): void;
    handleDataChanged(): void;
}
export declare function h1(text: string): TextElement<any>;
export declare function h2(text: string, ...children: UIComponent[]): TextElement<any>;
export declare function h3(text: string, ...children: UIComponent[]): TextElement<any>;
export declare function applyStyling(classes: TextClasses, element: BasicComponent<any>, highlights?: HighLightClasses): void;
export declare class AtomEditorElement extends TextElement<HTMLInputElement> {
    private _onchange;
    setOnChange(onChange: EventHandler): void;
    private _txt;
    num: number;
    constructor(text: string | IBinding, _onchange: EventHandler);
    private grammar;
    setGrammar(id: string): void;
    renderUI(): HTMLInputElement;
    private innerSetGrammar();
    protected mini: boolean;
    setMini(mini: boolean): void;
    isMini(): boolean;
    selectAll(): void;
    selectNone(): void;
    setPlaceholder(text: string): void;
    placeholder(): any;
    setSoftWrapped(wrap: boolean): boolean;
    dispose(): void;
    protected customize(element: HTMLInputElement): void;
    didChangeActionWithContext: () => void;
    didChangeAction(): void;
    setText(newText: string, handle?: boolean): void;
    handleDataChanged(): void;
    getValue(): any;
}
export declare function input(text: string | IBinding, onchange: EventHandler): AtomEditorElement;
export interface IField<T extends HTMLElement> extends BasicComponent<T> {
    caption(): string;
    setLabelWidth(w: number): any;
    setLabelHeight(h: number): any;
    setRequired(b: boolean): any;
}
export declare function alignComponents(comps: UIComponent[]): void;
export declare class AbstractWrapEditor<T extends BasicComponent<any>> extends BasicComponent<any> {
    protected _actualField: T;
    getBinding(): IBinding;
    setBinding(b: IBinding): void;
    getActualField(): T;
    addFocusListener(e: EventHandler): void;
    removeFocusListener(e: EventHandler): void;
}
export declare class DialogField<T extends BasicComponent<any>> extends AbstractWrapEditor<T> implements IField<any> {
    protected _textLabelPanel: Panel;
    protected _textLabel: Label;
    protected _required: boolean;
    protected _rlab: Label;
    setRequired(b: boolean): void;
    setLabelWidth(w: number): void;
    setLabelHeight(h: number): void;
    protected selfInit(): void;
    hideLabel(): void;
    makeLabelNextToField(): void;
    protected createLabel(caption: any): void;
    constructor(caption: string, l?: LayoutType);
}
export interface Converter<F, T> {
    (v: F): T;
}
export declare class WrapEditor extends AbstractWrapEditor<any> {
    protected selfRender(): HTMLDivElement;
    protected createBinding(): BasicBinding;
    constructor();
    setActualField(newField: BasicComponent<any>, conv: Converter<any, any>): void;
}
export interface ModeSpec {
    firstOption: BasicComponent<any>;
    secondOption: BasicComponent<any>;
    valueComesAsSecond: boolean;
    firstOptionLabel: string;
    secondOptionLabel: string;
    secondValidator: Validator<any>;
    firstValidator: Validator<any>;
    firstToSecondConverter: Converter<any, any>;
    secondToFirstConverter: Converter<any, any>;
    firstToOutConverter?: Converter<any, any>;
    secondToOutConverter?: Converter<any, any>;
}
export interface MultiValueController {
    createNewField(): BasicComponent<any>;
    decompose(v: any): any[];
    compose(v: any[]): any;
}
export interface CustomizationController {
    createBasicField(): BasicComponent<any>;
    createDetailsField(): BasicComponent<any>;
    isDetailsVisible(basicVlue: any, x: any): boolean;
    getBasicPart(x: any): any;
    updateDetails(basicValue: any, value: any, details: BasicComponent<any>): any;
}
export declare class StuffWithButtons extends Panel {
    private host;
    plus: BasicComponent<any>;
    minus: BasicComponent<any>;
    embedded: BasicComponent<any>;
    constructor(host: {
        _actualField: BasicComponent<any>;
        containers: StuffWithButtons[];
        updateSigns: () => void;
        createElementUI: () => StuffWithButtons;
    });
    setPlusVisible(v: boolean): void;
    setMinusVisible(v: boolean): void;
}
export declare class MultiValueField extends DialogField<Panel> {
    private _controller;
    constructor(caption: string, value: any, onChange: EventHandler, _controller: MultiValueController);
    private updateSigns();
    containers: StuffWithButtons[];
    private createElementUI(v);
}
export declare class FieldWithCustomization extends DialogField<Panel> {
    private _controller;
    private basic;
    private defails;
    constructor(caption: string, value: any, onChange: EventHandler, _controller: CustomizationController);
    getBinding(): IBinding;
    protected handleDataChanged(): void;
}
export declare class DialogFieldWithModes extends DialogField<WrapEditor> {
    private _config;
    ref: TextElement<any>;
    isFirst: boolean;
    getBinding(): any;
    constructor(caption: string, value: string, onChange: EventHandler, _config: ModeSpec);
    switchMode(): void;
    protected selfInit(): void;
}
export declare class TextField extends DialogField<AtomEditorElement> {
    setTabIndex(index: number): void;
    constructor(caption: string, value: string | IBinding, onChange: EventHandler, layoutType?: LayoutType, placeholder?: string);
    dispose(): void;
    customize(element: any): void;
}
export declare class SelectField extends DialogField<Select> {
    constructor(caption: string, onChange: EventHandler, value?: string, ic?: Icon, options?: string[], l?: LayoutType);
    setDisabled(disabled: boolean): void;
}
export declare class LabelField extends DialogField<Label> {
    constructor(caption?: string, value?: string, icon?: Icon, tc?: TextClasses, hl?: HighLightClasses, l?: LayoutType);
    setText(text: string, handle?: boolean): void;
    getText(): string;
}
export declare class CustomField extends DialogField<BasicComponent<any>> {
    constructor(caption: string, value: BasicComponent<any>, onChange: EventHandler, l?: LayoutType);
}
export declare class EnumField extends DialogField<Select> {
    private options;
    setRequired(b: boolean): void;
    constructor(caption: string, value: string, options: string[], onChange: EventHandler, l?: LayoutType);
}
export declare function texfField(lbl: string, text: string, onchange: EventHandler): TextField;
export declare enum FieldTypes {
    BOOL = 0,
    STRING = 1,
    NUMBER = 2,
    INTEGER = 3,
    ENUM = 4,
    DATE = 5,
}
export interface FieldSpec {
    caption: string;
    description: string;
    type: FieldTypes;
    required: boolean;
    defaultValue: string;
    realm: string[];
    example: string;
}
export declare function createInputField(spec: FieldSpec, vl: any, onchange?: EventHandler): IField<any>;
export declare function okStatus(): {
    code: StatusCode;
    message: string;
};
export declare function errorStatus(message: string): {
    code: StatusCode;
    message: string;
};
export declare function createSmallTypeScriptEditor(caption: string, value: string, onchange?: EventHandler): TextField;
export declare class BasicListanable<E, T> implements IListenable<T> {
    _listeners: T[];
    addListener(listener: T): void;
    removeListener(listener: T): void;
    protected fireChange(e: E): void;
    protected notify(e: E, l: T): void;
}
export interface KnowsFilterLabel {
    filterLabel(): string;
}
export declare class BasicFilter extends BasicListanable<PropertyChangeEvent, PropertyChangeListener> implements ViewerFilter<any> {
    _filterPattern: string;
    setPattern(s: string): void;
    getPatten(): string;
    accept(viewer: StructuredViewer<any, any>, value: any, parent: any): boolean;
    protected notify(e: PropertyChangeEvent, l: PropertyChangeListener): void;
}
export interface Predicate<T> {
    (v: T): boolean;
}
export declare class ToggleFilter<T> extends BasicListanable<PropertyChangeEvent, PropertyChangeListener> implements ViewerFilter<T> {
    constructor(func: Predicate<T>);
    private _on;
    private _func;
    setOn(s: boolean): void;
    isOn(): boolean;
    accept(viewer: StructuredViewer<any, any>, value: T, parent: any): boolean;
    protected notify(e: PropertyChangeEvent, l: PropertyChangeListener): void;
}
export declare class Section extends Panel {
    private _header;
    getHeaderVisible(): boolean;
    setHeaderVisible(value: boolean): void;
    private _chevron;
    private _headerVisible;
    constructor(_header: TextElement<any>, collapsible: boolean);
    caption(): string;
    private _expanded;
    isExpanded(): boolean;
    getHeader(): TextElement<any>;
    getIcon(): Icon;
    protected customize(element: HTMLDivElement): void;
    _collapseListener: EventHandler;
    setCollapsible(c: boolean): void;
    setExpanded(expanded: boolean): void;
}
export declare class BasicViewer<M> extends Viewer<M> {
    private renderer;
    panel: Panel;
    constructor(renderer: ICellRenderer<M>);
    dispose(): void;
    renderUI(): any;
    setInput(value: M, refresh?: boolean): void;
}
export declare class TabFolder extends Panel {
    constructor();
    private _selectedIndex;
    private _buttons;
    private _tabs;
    add(header: string, icon: Icon, content: UIComponent, extraClass?: string): void;
    tabsCount(): number;
    addChild(childPanel: Panel): void;
    replaceChild(newChild: UIComponent, oldChild: UIComponent): void;
    get(index: number): {
        header: string;
        content: UIComponent;
    };
    private _onselected;
    setOnSelected(f: {
        (): void;
    }): void;
    selectedComponent(): UIComponent;
    toggle(index: number, show: boolean): void;
    setSelectedIndex(index: number): void;
}
export interface Convertor<T, R> {
    (v: T): R;
}
export declare function label(text: string, ic?: Icon, tc?: TextClasses, th?: HighLightClasses): TextElement<any>;
export declare function html(text: string): InlineHTMLElement;
export declare function a(text: string, e: EventHandler, ic?: Icon, tc?: TextClasses, th?: HighLightClasses): TextElement<any>;
export declare function checkBox(caption: string, h?: EventHandler): CheckBox;
export declare function select(caption: string): Select;
export declare function button(txt: string, _size?: ButtonSizes, _highlight?: ButtonHighlights, _icon?: Icon, onClick?: EventHandler): Button;
export declare function buttonSimple(txt: string, onClick?: EventHandler, _icon?: Icon): Button;
export declare function toggle(txt: string, _size?: ButtonSizes, _highlight?: ButtonHighlights, _icon?: Icon, onClick?: EventHandler): ToggleButton;
export declare function renderer<T>(v: WidgetCreator<T>): ICellRenderer<T>;
export declare function treeViewer<T>(childFunc: ObjectToChildren<T>, renderer: ICellRenderer<T>, labelProvider?: LabelFunction<T>): TreeViewer<T, T>;
export declare function treeViewerSection<T>(header: string, icon: Icon, input: T, childFunc: ObjectToChildren<T>, renderer: ICellRenderer<T>): TreePanel<T, T>;
export declare function filterField(viewer: StructuredViewer<any, any>): TextField;
export declare function toggleFilter<T>(viewer: StructuredViewer<any, T>, icon: Icon, pred: Predicate<T>, on?: boolean, desc?: string): ToggleButton;
export declare function section(text: string, ic?: Icon, collapsable?: boolean, colapsed?: boolean, ...children: UIComponent[]): Section;
export declare function masterDetailsPanel<T, R>(selectionProvider: SelectionViewer<T>, viewer: Viewer<R>, convert?: Convertor<T, R>, horizontal?: boolean): Panel;
export declare function hcTight(...children: UIComponent[]): Panel;
export declare function hc(...children: UIComponent[]): Panel;
export declare function vc(...children: UIComponent[]): Panel;
export declare function li(...children: UIComponent[]): Panel;
export declare function masterDetails<R, T>(selectionProvider: SelectionProvider<T>, viewer: Viewer<R>, convert?: Convertor<T, R>): void;
/**
 * function to show dialog prompt
 * @param name
 * @param callBack
 * @param initialValue
 */
export declare function prompt(name: string, callBack: (newValue: string) => void, initialValue?: string): void;
export import fdUtils = require("./fileDialogUtils");
