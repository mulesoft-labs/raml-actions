import _ = require("underscore")
import contextActions = require("../../../actionManagement/contextActions")
import contextActionsImpl = require("../../../actionManagement/contextActionsImpl")
import sharedCalculator = require("../../../actionManagement/sharedASTStateCalculator")
import parser=require("raml-1-parser");
import hl=parser.hl;
import lowLevel = parser.ll;
import search=parser.search;
import universeHelpers = parser.universeHelpers;
import def=parser.ds
import su=parser.schema;
import stubs=parser.stubs;
import path = require ('path')
import utils = require("../../../actionManagement/utils")
import fs = require ('fs')
import apiModifier = parser.parser.modify;
import wrapper = parser.api10;
import completeBodyUI = require("./ui")
import externalDisplay = require("../externalDisplay")




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

var completeBodyStateCalculator = new CompleteBodyStateCalculator();

var completeBody : contextActions.IContextDependedUIAction = {
    id: "completeBody",

    name: "Complete body",
    target: contextActions.TARGET_RAML_EDITOR_NODE,
    category: ["Add new..."],

    onClick: (contextState : hl.IHighLevelNode, uiState : completeBodyUI.ICompleteBodyOutputUIState)=> {

        // var h = <hl.IHighLevelNode>state;
        // h.lowLevel().show('BODY');
        // new FillBodyDialog(h.parent().parent(), h).show()

        var parentOfParent = contextState.parent().parent()
        parentOfParent.lowLevel().show('BODY');

        var generalState = completeBodyStateCalculator.getGeneralState();

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
            var responseOrMethod = contextState;
            if (!(universeHelpers.isResponseType(responseOrMethod.property().range()) || universeHelpers.isMethodType(responseOrMethod.property().range()))) {
                console.log("Incorrect parent " + responseOrMethod.printDetails() + " , expecting response or method")
                return;
            }

            var responseWrapper = <wrapper.Response>responseOrMethod.wrapperNode();

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
    stateCalculator: completeBodyStateCalculator,
    shouldDisplay: state=>state != null,
    initialUIStateConvertor : null,
    displayUI: new externalDisplay.DefaultExternalUIDisplay(
        require.resolve("../externalDisplay"))

}

function getKeyValue(offset, txt) {
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
}

export function saveExample(r:hl.IHighLevelNode, schp:string, content:string, editor : sharedCalculator.IAbstractTextEditor) {

    var sdir = path.resolve(path.dirname(editor.getPath()), path.dirname(schp));
    if (!fs.existsSync(sdir)) {
        fs.mkdirSync(sdir);
    }
    var shFile = path.resolve(path.dirname(editor.getPath()), schp);
    fs.writeFileSync(shFile, content)
}

/**
 * Registers the action.
 */
export function registerAction() {

    contextActionsImpl.addAction(completeBody);
}