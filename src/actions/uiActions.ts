//This file contains a set of action, which do require UI to be displayed

import _ = require("underscore")
import contextActions = require("../actionManagement/contextActions")
import contextActionsImpl = require("../actionManagement/contextActionsImpl")
import sharedCalculator = require("../actionManagement/sharedASTStateCalculator")
import parser=require("raml-1-parser");
import hl=parser.hl;
import lowLevel = parser.ll;
import search=parser.search;
import universeHelpers = parser.universeHelpers;
import def=parser.ds
import su=parser.schema;
import stubs=parser.stubs;
import path = require ('path')
import utils = require("../actionManagement/utils")
import fs = require ('fs')
import apiModifier = parser.parser.modify;
import wrapper = parser.api10;

function standardToUIAction(original : contextActions.IContextDependedAction,
    initialUIStateConvertor : contextActions.IStateConvertor,
    displayUI : contextActions.IUIDisplay) : contextActions.IContextDependedUIAction{

    return {
        name: original.name,

        target: original.target,

        category: original.category,

        onClick: original.onClick,

        stateCalculator: original.stateCalculator,

        shouldDisplay: original.shouldDisplay,

        initialUIStateConvertor : initialUIStateConvertor,

        displayUI : displayUI
    }
}

function indent(line:string) {
    var rs = "";
    for (var i = 0; i < line.length; i++) {
        var c = line[i];
        if (c == '\r' || c == '\n') {
            continue;
        }
        if (c == ' ' || c == '\t') {
            rs += c;
            continue;
        }
        break;
    }
    return rs;
}

function stripIndent(text:string, indent:string) {
    var lines = utils.splitOnLines(text);
    var rs = [];
    for (var i = 0; i < lines.length; i++) {
        if (i == 0) {
            rs.push(lines[0]);
        }
        else {
            rs.push(lines[i].substring(indent.length));
        }
    }
    return rs.join("");
}

class MoveContentStateCalculator extends sharedCalculator.CommonASTStateCalculator {

    calculate():any {

        var generalState = this.getGeneralState()
        if (!generalState) return null

        if (generalState.completionKind != search.LocationKind.KEY_COMPLETION)
            return null;


        var highLevelNode = <hl.IHighLevelNode>generalState.node;

        if (highLevelNode.children().length == 0)
            return null

        return highLevelNode
    }
}

var moveContentsStateCalculator = new MoveContentStateCalculator();

var moveContents : contextActions.IContextDependedAction = {
    name: "Move content to other file",

    target: contextActions.TARGET_RAML_EDITOR_NODE,

    category: ["Refactoring"],

    onClick: (contextState: hl.IHighLevelNode, uiState : string)=> {
        var generalState = moveContentsStateCalculator.getGeneralState();

        var currentFilePath = generalState.editor.getPath();
        var destination = uiState;
        var node = contextState;

        var d = path.resolve(path.dirname(currentFilePath), destination);

        var replacements = [];

        var dump = node.lowLevel().dump();
        
        findIncludesInside(node.lowLevel()).forEach(include => {
            var includePath = include.includePath();

            if(path.isAbsolute(includePath)) {
                return;
            }
            
            var includeStart = include.start() - node.lowLevel().start();
            var includeEnd = include.end() - node.lowLevel().start();
            
            replacements.push({
                start: includeStart,
                end: includeEnd,
                oldText: dump.substring(includeStart, includeEnd),
                oldPath: includePath,
                newPath:  path.relative(path.dirname(d), path.resolve(path.dirname(currentFilePath), includePath))
            })
        });
        
        var startIndex = 0;
        
        var splitted = [];
        
        replacements.forEach(replacement => {
            splitted.push(dump.substring(startIndex, replacement.start));
            
            splitted.push(dump.substring(replacement.start, replacement.end).replace(replacement.oldPath, replacement.newPath));

            startIndex = replacement.end;
        });
        
        splitted.push(dump.substring(startIndex));
        
        dump = splitted.join('');

        var ci = utils.splitOnLines(dump);

        var li = ci.length > 1 ? indent(ci[1]) : indent(ci[0]);

        dump = dump.substring(node.lowLevel().keyEnd() - node.lowLevel().start() + 1).trim();
        dump = stripIndent(dump, li);

        var ramlComment = node.definition().universe().version()==="RAML10" ? "#%RAML 1.0 " : "#%RAML 0.8 "

        dump = ramlComment + node.definition().nameId() + "\n" + dump;
        fs.writeFileSync(d, dump);
        //no we need to replace content of the node with text;

        var txt = node.lowLevel().unit().contents();
        var endPart = txt.substring(node.lowLevel().end());
        var startPart = txt.substring(0, node.lowLevel().keyEnd() + 1);
        var vl = startPart + " !include " + destination + endPart;
        generalState.editor.setText(vl);
    },

    stateCalculator: moveContentsStateCalculator,

    shouldDisplay: state=>state != null
}

function findIncludesInside(node: lowLevel.ILowLevelASTNode): lowLevel.ILowLevelASTNode[] {
    var children: lowLevel.ILowLevelASTNode[] = node.children();
    
    var result = [];
    
    if(children && children.length > 0) {
        children.forEach(child => {
            if(child.includePath()) {
                result.push(child);
                
                return;
            }
            
            result = result.concat(findIncludesInside(child));
        });
    }
    
    return result;
}

function isAbsolute(location: string): boolean {
    if(!location) {
        return false;
    }

    if(path.isAbsolute(location)) {
        return true;
    }

    if(location.trim().toLowerCase().indexOf('http:/') === 0) {
        return true;
    }

    return false;
}

export interface MoveContentsDisplayUI extends contextActions.IUIDisplay {
    /**
     * destination - target file destination
     */
    (uiFinishedCallback : (destination:string)=>void) : void;
}

export function registerMoveContentsAction(displayUI : MoveContentsDisplayUI) {

    var uiAction = standardToUIAction(moveContents, null, displayUI)
    contextActionsImpl.addAction(uiAction);
}

var getKeyValue = function (offset, txt) {
    var m = offset;

    for (var i = offset; i >= 0; i--) {
        var c = txt.charAt(i);
        if (c == ' ' || c == '\r' || c == '\n' || c == '\t') {
            m = i + 1;
            break;
        }
    }
    var res = "";
    for (var i = m; i < txt.length; i++) {
        var c = txt.charAt(i);
        if (c == ' ' || c == '\r' || c == '\n' || c == '\t' || c == ':') {
            break;
        }
        res += c;
    }
    return res;
};

export function saveExample(r:hl.IHighLevelNode, schp:string, content:string, editor : sharedCalculator.IAbstractTextEditor) {

    var sdir = path.resolve(path.dirname(editor.getPath()), path.dirname(schp));
    if (!fs.existsSync(sdir)) {
        fs.mkdirSync(sdir);
    }
    var shFile = path.resolve(path.dirname(editor.getPath()), schp);
    fs.writeFileSync(shFile, content)
}

class CompleteBodyStateCalculator extends sharedCalculator.CommonASTStateCalculator {

    calculate():any {

        var generalState = this.getGeneralState()
        if (!generalState) return null

        if (generalState.completionKind != search.LocationKind.KEY_COMPLETION)
            return null;

        var highLevelNode = <hl.IHighLevelNode>generalState.node;

        if (universeHelpers.isResponseType(highLevelNode.definition()) ||
            universeHelpers.isMethodType(highLevelNode.definition())) {
            var txt = generalState.editor.getText();
            var res = getKeyValue(generalState.offset, txt);
            if (res == "body") {
                return highLevelNode
            }
        }
        if (universeHelpers.isBodyLikeType(highLevelNode.definition())) {
            if (highLevelNode.elements().length == 0) {
                return highLevelNode
            }
        }

        return null
    }
}

export interface ICompleteBodyUIState {
    /**
     * Body name.
     */
    name : string,

    /**
     * Whether JSON content type needs to be generated
     */
    needJSON : boolean,

    /**
     * Whether XML content type needs to be generated
     */
    needXML : boolean,

    /**
     * JSON example contents
     */
    jsexample : string,

    /**
     * XML example contents
     */
    xmlexample : string,

    /**
     * JSON schema contents
     */
    jsschema : string,

    /**
     * XML schema contents
     */
    xmlschema : string
}

var completeBody = {
    name: "Complete body",
        target: contextActions.TARGET_RAML_EDITOR_NODE,
    category: ["Add new..."],

    onClick: (contextState : hl.IHighLevelNode, uiState : ICompleteBodyUIState)=> {

        // var h = <hl.IHighLevelNode>state;
        // h.lowLevel().show('BODY');
        // new FillBodyDialog(h.parent().parent(), h).show()

        var parentOfParent = contextState.parent().parent()
        parentOfParent.lowLevel().show('BODY');

        var generalState = moveContentsStateCalculator.getGeneralState();

        var bodyType = <def.NodeClass>contextState.definition().universe().type("BodyLike");
        if (bodyType) {
            //RAML 0.8 case

            var node = contextState;
            if (universeHelpers.isBodyProperty(node.property())) {
                node = node.parent();
            }
            var type = <def.NodeClass>node.definition();

            if (uiState.needJSON) {
                var body = <hl.IEditableHighLevelNode>stubs.createStubNode(bodyType,type.property('name'), "application/json");
                body.createAttr("schema", uiState.name);
                body.createAttr("example", "!include ./examples/" + uiState.name + ".json");
                node.add(body);
                utils.createGlobalSchemaFromNameAndContent(parentOfParent.root(),
                    uiState.name, "schemas/" + uiState.name + ".json", uiState.jsschema,generalState.editor)

                saveExample(parentOfParent, "./examples/" + uiState.name + ".json", uiState.jsexample, generalState.editor);
            }
            if (uiState.needXML) {
                var body = <hl.IEditableHighLevelNode>stubs.createStubNode(bodyType,type.property('name'), "application/xml");
                body.createAttr("schema", uiState.name + "-xml");
                body.createAttr("example", "!include ./examples/" + uiState.name + ".xml");
                node.add(body);
                var xmlSchemaContents = uiState.xmlschema;
                utils.createGlobalSchemaFromNameAndContent(parentOfParent.root(),
                    uiState.name + "-xml", "schemas/" + uiState.name + ".xml", xmlSchemaContents, generalState.editor)

                saveExample(parentOfParent, "./examples/" + uiState.name + ".xml", uiState.xmlexample, generalState.editor);
            }
        } else {
            //RAML 1.0 case
            var response = contextState;
            if (!universeHelpers.isResponseType(response.property().range())) {
                console.log("Incorrect parent " + response.printDetails() + " , expecting response")
                return;
            }

            var responseWrapper = <wrapper.Response>response.wrapperNode();

            var bodies: wrapper.TypeDeclaration[] = [];

            if (uiState.needJSON) {
                var typeName = "application/json"

                var bodyWrapper = apiModifier.createTypeDeclaration(typeName)

                apiModifier.setTypeDeclarationSchema(bodyWrapper, uiState.name)
                apiModifier.setTypeDeclarationExample(bodyWrapper, "!include ./examples/" + uiState.name + ".json")
                utils.createGlobalSchemaFromNameAndContent(parentOfParent.root(),
                    uiState.name, "schemas/" + uiState.name + ".json", uiState.jsschema, generalState.editor)

                saveExample(parentOfParent, "./examples/" + uiState.name + ".json", uiState.jsexample, generalState.editor);

                bodies.push(bodyWrapper);
            }

            if (uiState.needXML) {
                var typeName = "application/xml"

                var bodyWrapper = apiModifier.createTypeDeclaration(typeName)

                apiModifier.setTypeDeclarationSchema(bodyWrapper, uiState.name + "-xml")
                apiModifier.setTypeDeclarationExample(bodyWrapper, "!include ./examples/" + uiState.name + ".xml")
                var xmlSchemaContents = uiState.xmlschema;
                utils.createGlobalSchemaFromNameAndContent(parentOfParent.root(),
                    uiState.name + "-xml", "schemas/" + uiState.name + ".xsd", xmlSchemaContents, generalState.editor)

                saveExample(parentOfParent, "./examples/" + uiState.name + ".xml", uiState.xmlexample, generalState.editor);

                bodies.push(bodyWrapper);
            }

            bodies.forEach(bodyWrapper => {
                var foundWrapper = _.find(responseWrapper.body() || [], foundWrapper => bodyWrapper.name() === foundWrapper.name());if(foundWrapper) {
                    (<any>responseWrapper).remove(foundWrapper);
                }

                apiModifier.addChild(responseWrapper, bodyWrapper);
            })
        }

        var rs = parentOfParent.lowLevel().unit().contents();
        generalState.editor.setText(utils.cleanEmptyLines(rs));
    },
    stateCalculator: new CompleteBodyStateCalculator(),
    shouldDisplay: state=>state != null
}

export interface CompleteBodyDisplayUI extends contextActions.IUIDisplay {
    /**
     * uiState - summ of changes, user wants to generate
     */
    (uiFinishedCallback : (uiState:ICompleteBodyUIState)=>void) : void;
}

export function registerCompleteBodyAction(displayUI : CompleteBodyDisplayUI) {

    var uiAction = standardToUIAction(completeBody, null, displayUI)
    contextActionsImpl.addAction(uiAction);
}