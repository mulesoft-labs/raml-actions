import contextActions = require("./contextActions")

export import parser=require("raml-1-parser");
import search=parser.search;
import hl=parser.hl;
import ll=parser.ll;
import utils = require("./utils")

/**
 * Position in text.
 */
export interface IPoint {
    row:number;
    column:number;
}

/**
 * Range of positions in text.
 */
export interface IRange {
    start:IPoint;
    end:IPoint;
}

/**
 * Text editor buffer.
 */
export interface IEditorTextBuffer {

    /**
     * Gets position by the offset from the beginning of the document.
     * @param offset
     */
    positionForCharacterIndex(offset:number):IPoint

    /**
     * Gets offset from the beginning of the document by the position
     * @param position
     */
    characterIndexForPosition(position:IPoint):number;

    /**
     * Gets a range for the row number.
     * @param row - row number
     * @param includeNewline - whether to include new line character(s).
     */
    rangeForRow(row:number, includeNewline?:boolean):IRange;

    /**
     * Gets text in range.
     * @param range
     */
    getTextInRange(range:IRange):string;

    /**
     * Sets (replacing if needed) text in range
     * @param range - text range
     * @param text - text to set
     * @param normalizeLineEndings - whether to convert line endings to the ones standard for this document.
     */
    setTextInRange(range:IRange, text:string, normalizeLineEndings?:boolean):IRange;

    /**
     * Returns buffer text.
     */
    getText(): string;

    /**
     * Gets buffer end.
     */
    getEndPosition():IPoint;
}

/**
 * Abstract text editor, able to provide document text buffer and cursor position.
 */
export interface IAbstractTextEditor {
    /**
     * Returns complete text of the document opened in the editor.
     */
    getText() : string;

    /**
     * Gets text buffer for the editor.
     */
    getBuffer() : IEditorTextBuffer;

    /**
     * Gets file path.
     */
    getPath();

    /**
     * Returns current cursor position
     */
    getCursorBufferPosition() : IPoint;

    /**
     * Sets editor text.
     * @param text
     */
    setText(text:string);
}

/**
 * General state of AST of the opened editor
 */
export interface IGeneralASTState {

    /**
     * Editor. Is only provided for calculators if there is an editor provider set via
     * setEditorProvider method.
     *
     */
    editor : IAbstractTextEditor

    /**
     * Current offset in the editor
     */
    offset : number

    /**
     * Current node.
     */
    node : hl.IParseResult

    /**
     * Kind of completion.
     */
    completionKind : search.LocationKind

    /**
     * Optional modifier of AST.
     */
    astModifier? : IASTModifier;
}

/**
 * Provider, which can return current text editor
 */
export interface IEditorProvider {

    /**
     * Returns current text editor.
     */
    getCurrentEditor() : IAbstractTextEditor
}

/**
 * Sets editor provider. This method MUST be called at least once, otherwise
 * it will be impossible to calculate the state and an empty state will be returned.
 * @param editorProvider
 */
export function setEditorProvider(editorProvider : IEditorProvider) {
    generalASTStateCalculator.setEditorProvider(editorProvider)
}

/**
 * Provides current AST state.
 * If set via setASTProvider method, will be used instead of a new AST calculation
 * by parsing the text provided by IEditorProvider.
 */
export interface IASTProvider {

    /**
     * Gets current AST root.
     */
    getASTRoot() : hl.IHighLevelNode;

    /**
     * Gets current AST node
     */
    getSelectedNode() : hl.IParseResult;
}

/**
 * Sets AST provider.
 * If set, will be used instead of a new AST calculation
 * by parsing the text provided by IEditorProvider.
 */
export function setASTProvider(astProvider : IASTProvider) {
    generalASTStateCalculator.setASTProvider(astProvider)
}

/**
 * Provider for AST modifications.
 */
export interface IASTModifier {

    /**
     * Deletes node
     * @param node
     */
    deleteNode(node: hl.IParseResult);

    /**
     * Updates text for the give node.
     * @param node
     */
    updateText(node: ll.ILowLevelASTNode);
}

/**
 * Sets AST modifier.
 */
export function setASTModifier(astModifier : IASTModifier) {
    generalASTStateCalculator.setASTModifier(astModifier)
}

/**
 * For those who ignore state calculators approach. Is not recommended to use.
 */
export class NullCalculator implements contextActions.IContextStateCalculator {

    calculate () : any {
    }
}

class EditorBasedASTProvider implements IASTProvider {

    constructor(private editorProvider : IEditorProvider){
    }

    getASTRoot() : hl.IHighLevelNode {
        var editor = this.editorProvider.getCurrentEditor();
        if (!editor) return null;

        var filePath = editor.getPath();

        var prj=parser.project.createProject(utils.dirname(filePath));
        var offset=editor.getBuffer().characterIndexForPosition(
            editor.getCursorBufferPosition());
        var text=editor.getBuffer().getText();

        var unit=prj.setCachedUnitContent(utils.basename(filePath),text);

        return <hl.IHighLevelNode>unit.highLevel();
    }

    getSelectedNode() : hl.IParseResult {

        var editor = this.editorProvider.getCurrentEditor();
        if (!editor) return null;

        var ast = this.getASTRoot();
        if (!ast) return null;

        var offset = editor.getBuffer().characterIndexForPosition(
            editor.getCursorBufferPosition());

        var modifiedOffset = offset;

        var text = editor.getText();

        for (var currentOffset=offset-1;currentOffset>=0;currentOffset--){
            var currentCharacter=text[currentOffset];

            if (currentCharacter==' '||currentCharacter=='\t'){
                modifiedOffset=currentOffset-1;
                continue;
            }
            break;
        }
        var astNode=ast.findElementAtOffset(modifiedOffset);

        if (!astNode){
            return ast;
        }

        return astNode;
    }
}

/**
 * This class calculates current open editor AST state, including the selected node.
 *
 * The state is actually calculated on the global calculation start, and calling "calculate"
 * just returns the state. This allows to reuse a single instance in many actions
 * and only perform the actual state calculation once.
 *
 * On reuse please call contextCalculationStarted and contextCalculationFinished methods
 * from respective methods of the state calculator that reuses current one.
 *
 * It is not recommended to inherit the class, instead, reuse the exported instance of the class
 * so that AST parsing is performed once.
 */
export class GeneralASTStateCalculator implements contextActions.IContextStateCalculator {

    private state : IGeneralASTState = null;
    private editorProvider : IEditorProvider;
    private astProvider : IASTProvider;
    private astModifier : IASTModifier;

    /**
     * Is called to calculate context
     */
    calculate () : any {

        //should actually never happened if this class is reused properly
        if (this.state == null) {
            this.state = this.calculateState()
        }

        return this.state
    }

    /**
     * If present is called before any context calculations are started
     */
    contextCalculationStarted : () => void = () => {

        if (this.state == null) {
            this.state = this.calculateState()
        }
    }

    /**
     * If present is called after all context calculations are finished
     */
    contextCalculationFinished : () => void = () => {

        //deleting current state
        this.state = null
    }

    private calculateState() : IGeneralASTState {

        if (!this.editorProvider) {
            return {
                editor : null,
                offset : 0,
                node : null,
                completionKind : null
            }
        }

        var editor = this.editorProvider.getCurrentEditor();

        var astProvider = this.astProvider;
        if (!astProvider) astProvider = new EditorBasedASTProvider(this.editorProvider);

        var gotEditorFromOutline = false;

        if (!editor) return null

        if (utils.extname(editor.getPath()) != '.raml') return null

        var request = {
            editor: editor,
            bufferPosition: editor.getCursorBufferPosition()
        };

        var node = astProvider.getSelectedNode();

        if (editor.getBuffer()) {
            var lastPosition = editor.getBuffer().getEndPosition();
            if (lastPosition.column == request.bufferPosition.column
                && lastPosition.row == request.bufferPosition.row) {
                return null;
            }
            if (request.bufferPosition.row == 0 && request.bufferPosition.column == 0) {
                return null;
            }
        }

        if (!node) {
            return null;
        }

        var offset = request.editor.getBuffer().
            characterIndexForPosition(request.bufferPosition);

        var completionKind = search.determineCompletionKind(editor.getBuffer().getText(), offset);

        return {
            editor : editor,
            offset : offset,
            node : node,
            completionKind : completionKind,
            astModifier : this.astModifier
        }
    }

    setEditorProvider(editorProvider : IEditorProvider) {
        this.editorProvider = editorProvider;
    }

    setASTProvider(astProvider : IASTProvider) {
        this.astProvider = astProvider;
    }

    setASTModifier(astModifier : IASTModifier) {
        this.astModifier = astModifier;
    }

    getEditor() : IAbstractTextEditor {
        if (!this.editorProvider) return null;

        return this.editorProvider.getCurrentEditor();
    }
}

/**
 * Global instance of General AST state calculator to reuse it across custom
 * calculators. It is recommended to inherit CommonASTStateCalculator instead.
 * @type {GeneralASTStateCalculator}
 */
export var generalASTStateCalculator = new GeneralASTStateCalculator()

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
        return <IGeneralASTState> generalASTStateCalculator.calculate()
    }

    contextCalculationStarted : () => void = () => {
        generalASTStateCalculator.contextCalculationStarted()
    }

    contextCalculationFinished : () => void = () => {
        generalASTStateCalculator.contextCalculationFinished()
    }

    getEditor() : IAbstractTextEditor {
        return generalASTStateCalculator.getEditor()
    }
}