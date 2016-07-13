//This file contains a set of action, which do not require any UI to be displayed.
import _ = require("underscore")
import contextActions = require("../actionManagement/contextActions")
import sharedCalculator = require("../actionManagement/sharedASTStateCalculator")
import parser=require("raml-1-parser");
import hl=parser.hl;
import lowLevel = parser.ll;
import search=parser.search;
import universeHelpers = parser.universeHelpers;
import def=parser.ds
import su=parser.schema;
import stubs=parser.stubs;

class CommentNodeCalculator extends sharedCalculator.CommonASTStateCalculator {

    calculate():any {

        var generalState = this.getGeneralState()
        if (!generalState) return null

        return generalState
    }
}

function findLowLevelNodeByOffset(root:lowLevel.ILowLevelASTNode, offset:number):lowLevel.ILowLevelASTNode {
    if ((root.keyStart() > offset || root.valueEnd() < offset) && root.parent()) {
        return null;
    }

    if(root.includedFrom()) {
        return findLowLevelNodeByOffset(root.includedFrom(), offset);
    }

    var children = root.children()
    for (var key in children) {
        var child = children[key]
        var result = findLowLevelNodeByOffset(child, offset)
        if (result) return result;
    }

    return root;
}

function lastChild(root:lowLevel.ILowLevelASTNode) {
    if(root.includedFrom()) {
        return root.includedFrom();
    }

    if(!root.children() || root.children().length === 0) {
        return root;
    }

    return lastChild(root.children().filter(child => child ? true : false)[root.children().length - 1]);
}

class ConvertTypeToJsonSchemaStateCalculator extends sharedCalculator.CommonASTStateCalculator {
    calculate():any {
        var generalState = this.getGeneralState()
        if (!generalState) return null
        var highLevelNode = <hl.IHighLevelNode>generalState.node;
        //console.log('definition: ' + highLevelNode.definition().name() + '; ' + generalState.completionKind);
        if (generalState.completionKind != search.LocationKind.KEY_COMPLETION
            && generalState.completionKind != search.LocationKind.VALUE_COMPLETION)
            return null;
        var txt = generalState.editor.getText();
        //var res = getKeyValue(generalState.offset, txt);
        //return (res == 'type')? highLevelNode: null;

        var attr = _.find(highLevelNode.attrs(),
            x=>x.lowLevel().start() < generalState.offset && x.lowLevel().end() >= generalState.offset && !x.property().getAdapter(def.RAMLPropertyService).isKey());

        if (!attr) return null

        if (!attr.value()) return null

        var p:hl.IProperty = attr.property();

        if (!universeHelpers.isTypeProperty(p)) return null
        return highLevelNode
    }
}

class ConvertTypeToJsonSchemaAtTypeStateCalculator extends sharedCalculator.CommonASTStateCalculator {
    calculate():any {
        var generalState = this.getGeneralState()
        if (!generalState) return null
        var node = <hl.IHighLevelNode>generalState.node;
        //highLevelNode.lowLevel().show('HL');
        //console.log('node def: ' + node.property().name() + ': ' + node.definition().name() + '; ' + generalState.completionKind);
        if (generalState.completionKind != search.LocationKind.SEQUENCE_KEY_COPLETION &&
            generalState.completionKind != search.LocationKind.KEY_COMPLETION)
            return null;
        return universeHelpers.isTypesProperty(node.property()) ? node : null;
    }
}

class DeleteCurrentNodeStateCalculator extends sharedCalculator.CommonASTStateCalculator {
    calculate () : any {

        var generalState = this.getGeneralState()
        if (!generalState) return null

        var highLevelNode = <hl.IHighLevelNode><any>generalState.node;

        if (universeHelpers.isApiType(highLevelNode.definition()))
            return null

        return highLevelNode
    }
}

function doDeleteNode(node: hl.IParseResult, modifier?:sharedCalculator.IASTModifier) {
    if (!node || !node.parent()) return false;
    var parent = node.parent();

    if (modifier) {
        modifier.deleteNode(node)
    }
    else if (parent) {
        parent.remove(<any>node);
    }

    if (modifier && parent) {
        modifier.updateText(parent.lowLevel());
    }
}

var expandTypeToJSONSchemaDefinitionCalculator = new ConvertTypeToJsonSchemaAtTypeStateCalculator();
export var expandTypeToJSONSchemaDefinition : contextActions.IContextDependedAction = {
    name: "Expand type to JSON schema definition",
    target: contextActions.TARGET_RAML_EDITOR_NODE,
    category: ["Refactoring"],
    onClick: (state:hl.IHighLevelNode)=> {
        var typenode = <hl.IHighLevelNode>state;
        var api = typenode.root();
        //console.log('generate type ' + typenode.name());
        var obj = su.createModelToSchemaGenerator().generateSchema(typenode);
        var schema = JSON.stringify(obj, null, 2);
        console.log('schema: ' + schema);

        var generalState = expandTypeToJSONSchemaDefinitionCalculator.getGeneralState();
        doDeleteNode(state, generalState.astModifier)

        var typesProperty = state.root().definition().property("types");
        var typeStub = stubs.createStubNode((<def.NodeClass>state.definition().universe().type("TypeDeclaration")),typesProperty);
        typeStub.attrOrCreate('name').setValue(typenode.name());
        typeStub.attrOrCreate('type').setValue(schema);

        state.root().add(typeStub)

        var text = api.lowLevel().unit().contents();

        expandTypeToJSONSchemaDefinitionCalculator.getGeneralState().editor.setText(text)
        // state.editor.setText(text);
    },
    stateCalculator: expandTypeToJSONSchemaDefinitionCalculator,
    shouldDisplay: state=>state != null
}

var deleteNodeStateCalculator = new DeleteCurrentNodeStateCalculator();
export var deleteNode : contextActions.IContextDependedAction = {
    name : "Delete current node",
    target : contextActions.TARGET_RAML_EDITOR_NODE,
    category : ["Code"],
    onClick : (node:hl.IHighLevelNode)=>{
        var generalState = deleteNodeStateCalculator.getGeneralState();
        doDeleteNode(node, generalState.astModifier)
    },
    stateCalculator : deleteNodeStateCalculator,
    shouldDisplay : state=>state != null
}

var expandTypeToJSONSchemaCalculator = new ConvertTypeToJsonSchemaStateCalculator();
export var expandTypeToJSONSchema : contextActions.IContextDependedAction = {
    name: "Expand type to JSON schema",
    target: contextActions.TARGET_RAML_EDITOR_NODE,
    category: ["Refactoring"],
    onClick: (state:hl.IHighLevelNode)=> {
        var node = <hl.IHighLevelNode>state;
        var api = node.root();
        var type = node.attrValue('type');
        //console.log('schema: ' + schema);
        var types = <hl.IHighLevelNode[]>api.elementsOfKind('types');
        var typeNode = _.find(types, y=>y.name() == type);
        if (typeNode) {
            node.attr('type').setValue('');
            var obj = su.createModelToSchemaGenerator().generateSchema(typeNode);
            var text = JSON.stringify(obj, null, 2);
            node.attrOrCreate('schema').setValue(text);
            text = api.lowLevel().unit().contents();

            expandTypeToJSONSchemaCalculator.getGeneralState().editor.setText(text);
            // state.editor.setText(text);
        }
    },
    stateCalculator: expandTypeToJSONSchemaCalculator,
    shouldDisplay: state=>state != null
}

/**
 * Action, which comments out the current high-level node (not attribute!).
 */
export var commentNode : contextActions.IContextDependedAction = {

    name: "Comment node",

    target: contextActions.TARGET_RAML_EDITOR_NODE,

    category: ["Code"],

    onClick: (state : sharedCalculator.IGeneralASTState)=> {
        var highLevelNode:hl.IParseResult = state.node;

        if (!highLevelNode.lowLevel()) return;

        var lowLevelNode = findLowLevelNodeByOffset(highLevelNode.lowLevel(),
            (<sharedCalculator.IGeneralASTState>state).offset)

        if (!lowLevelNode) return;

        var startOffset = lowLevelNode.keyStart() > -1 ? lowLevelNode.keyStart() : lowLevelNode.start();

        lowLevelNode = lastChild(lowLevelNode);

        var endOffset = lowLevelNode.valueEnd() > -1 ? lowLevelNode.valueEnd() : lowLevelNode.end();

        var buffer = (<sharedCalculator.IGeneralASTState>state)
            .editor.getBuffer();
        var startPosition = buffer.positionForCharacterIndex(startOffset);
        var startLine = startPosition.row;

        var endPosition = buffer.positionForCharacterIndex(endOffset);
        var endLine = endPosition.row;

        for (var lineNumber:number = startLine; lineNumber <= endLine; lineNumber++) {

            var oldRange = buffer.rangeForRow(lineNumber, true);
            var oldText = buffer.getTextInRange(oldRange);
            var newText = "#" + oldText;

            buffer.setTextInRange(oldRange, newText)
        }
    },

    stateCalculator: new CommentNodeCalculator(),

    shouldDisplay: state=>state != null
}