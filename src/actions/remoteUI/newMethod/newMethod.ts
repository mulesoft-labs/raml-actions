import _ = require("underscore")
import contextActions = require("../../../actionManagement/contextActions")
import contextActionsImpl = require("../../../actionManagement/contextActionsImpl")
import sharedCalculator = require("../../../actionManagement/sharedASTStateCalculator")
import parser=require("raml-1-parser");
import hl=parser.hl;
import lowLevel = parser.ll;
import search=parser.search;
import universeHelpers = parser.universeHelpers;
import universeModule = parser.universes;
import defs=parser.ds
import su=parser.schema;
import stubs=parser.stubs;
import path = require ('path')
import utils = require("../../../actionManagement/utils")
import fs = require ('fs')
import apiModifier = parser.parser.modify;
import wrapper = parser.api10;
import newMethodUI = require("./ui")
import externalDisplay = require("../externalDisplay")
import khttp=require ("know-your-http-well");

class NewMethodStateCalculator extends sharedCalculator.CommonASTStateCalculator {

    calculate():any {

        contextActionsImpl.getLogger().debug("Starting to calculate state",
            "NewMethodStateCalculator", "calculate");

        var generalState = this.getGeneralState()

        contextActionsImpl.getLogger().debug("General state calculated: " + (generalState ? "true": "false"),
            "NewMethodStateCalculator", "calculate");

        if (!generalState) return null

        var highLevelNode = <hl.IHighLevelNode>generalState.node;

        const result = toResource(highLevelNode);

        contextActionsImpl.getLogger().debug("Result state calculated: " +
            (result ? "true": "false"),
            "NewMethodStateCalculator", "calculate");

        return result;
    }
}

var newMethodStateCalculator = new NewMethodStateCalculator();

var newMethod : contextActions.IContextDependedUIAction = {

    id: "newMethod",
    name: "New method",
    target: contextActions.TARGET_RAML_EDITOR_NODE,
    category: ["Add new..."],

    onClick: (contextState : hl.IHighLevelNode, uiState : newMethodUI.INewMethodOutputUIState)=> {
        onClick(contextState, uiState);
    },

    stateCalculator: newMethodStateCalculator,

    shouldDisplay: state=>state != null,

    initialUIStateConvertor : modelState=>{
        return generateInitialUIState(modelState.root());
    },

    displayUI: new externalDisplay.DefaultExternalUIDisplay(
        "")

}

function generateInitialUIState(ast) : newMethodUI.INewMethodInputUIState {

    return {
        methodDescriptions : getMethodDescriptions(ast),
        statusCodeDescriptions: getStatusCodeDescriptions(),
        typeValues: typeValues(ast)
    }
}

function onClick(
    contextState : hl.IHighLevelNode, uiState : newMethodUI.INewMethodOutputUIState) {

    const parent = contextState;

    var oldNode = parent.elementsOfKind('methods').filter(el => (el.attr('method').value() == uiState.method))[0];
    if (oldNode) {
        parent.remove(oldNode);
    }
    var methodNode = stubs.createMethodStub(parent, uiState.method);

    if (uiState.realBodyType){
        var bodyNode = stubs.createBodyStub(methodNode, uiState.realBodyType);
        if (uiState.bodyTypeString) {
            if (uiState.isSchema) {
                bodyNode.attrOrCreate("schema").setValue(uiState.bodyTypeString);
            }
            else bodyNode.attrOrCreate("type").setValue(uiState.bodyTypeString);
        }
        methodNode.add(bodyNode)
    }
    if (uiState.code) {

        var codeNode = stubs.createResponseStub(methodNode, uiState.code);
        methodNode.add(codeNode);

        if (uiState.bodyType) {
            var bodyNode = stubs.createBodyStub(codeNode, uiState.bodyType);
            if (uiState.actualType) {
                if (uiState.isSchema) {
                    bodyNode.attrOrCreate("schema").setValue(uiState.actualType);
                }
                else bodyNode.attrOrCreate("type").setValue(uiState.actualType);
            }
            codeNode.add(bodyNode);
        }

    }
    parent.add(methodNode);

    var rs = parent.lowLevel().unit().contents();

    var generalState = newMethodStateCalculator.getGeneralState();
    generalState.editor.setText(utils.cleanEmptyLines(rs));
}

export function toResource(node: hl.IHighLevelNode) {
    if (!node || !node.property()) return null;

    if ((universeHelpers.isResourcesProperty(node.property()) || universeHelpers.isResourceTypesProperty(node.property()))
        && (universeHelpers.isResourceType(node.definition()) || universeHelpers.isResourceTypeType(node.definition()))) return node;

    return null;
}


var _methodDescriptions;
function getMethodDescriptions(ast) {
    if (!_methodDescriptions) {
        _methodDescriptions = Object.create(null);
        var methodsProperty = ast.definition().property(
            universeModule.Universe10.Api.properties.resources.name)
            .range().property(universeModule.Universe10.ResourceBase.properties.methods.name);
        var list = methodsProperty.enumOptions();
        khttp.methods.filter(x=>list.indexOf(x.method.toLowerCase()) > -1).forEach(method => {
            var desc = method.description.trim().match(/^\"(.*)\"$/)[1];
            _methodDescriptions[method.method.toLowerCase()] = desc ? desc : method.description;
        });
    }
    return _methodDescriptions;
}

var _statusCodeDescriptions;
function getStatusCodeDescriptions() {
    if (!_statusCodeDescriptions) {
        _statusCodeDescriptions = Object.create(null);
        khttp.statusCodes.forEach(code => {
            var m, desc = code.description.trim();
            if (m = desc.match(/^\"(.*)\"/))
                desc = m[1];
            _statusCodeDescriptions[code.code] = desc;
        });
        _statusCodeDescriptions['7xx'] = "is for developer errors.";
    }
    return _statusCodeDescriptions;
}

function typeValues(parent) {
    var isSchema = false;
    var tp = parent.definition().universe().type(universeModule.Universe10.TypeDeclaration.name);
    if (!tp) {
        isSchema = true;
        tp = parent.definition().universe().type(universeModule.Universe08.BodyLike.name)
    }
    var sh = (<defs.NodeClass>tp).property(universeModule.Universe10.TypeDeclaration.properties.schema.name);
    var types = [];

    if (sh) {
        types =search.enumValues(<defs.Property>sh,parent) as string[];
    }
    return {isSchema: isSchema, types: types};
};

/**
 * Registers the action.
 */
export function registerAction() {

    contextActionsImpl.addAction(newMethod);
}