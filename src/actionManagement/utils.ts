/// <reference path="../../typings/main.d.ts" />

import path = require("path")
import fs = require("fs")
import parser=require("raml-1-parser");
import search=parser.search;
import hl=parser.hl;
import ll=parser.ll;
import def=parser.ds;
import stubs=parser.stubs;
import universes = parser.universes;
import universeHelpers = parser.universeHelpers;
import sharedCalc = require("./sharedASTStateCalculator")


export function dirname(pathStr:string) {
    return path.dirname(pathStr)
}

export function basename(pathStr:string) {
    return path.basename(pathStr)
}

export function extname(pathStr:string) {
    return path.extname(pathStr)
}

export function splitOnLines(text:string):string[]{
    var lines = text.match(/^.*((\r\n|\n|\r)|$)/gm);
    return lines;
}

export function createGlobalSchemaFromNameAndContent(root:hl.IHighLevelNode,name:string,schp:string,content:string,
                                                     editor: sharedCalc.IAbstractTextEditor,absolutePath?: string){
    if (universeHelpers.isRAML10Node(root)) {
        createGlobalSchemaFromNameAndContent10(root, name, schp, content, editor, absolutePath);
    } else if (universeHelpers.isRAML08Node(root)) {
        createGlobalSchemaFromNameAndContent08(root, name, schp, content, editor, absolutePath);
    }
}

function createSchemaFile(content : string, schemaPath : string, editor: sharedCalc.IAbstractTextEditor, absolutePath? : string) {

    var sdir=absolutePath ? path.dirname(absolutePath) : path.resolve(path.dirname(editor.getPath()),path.dirname(schemaPath));
    if (!fs.existsSync(sdir)){
        fs.mkdirSync(sdir);
    }
    var shFile=absolutePath ? absolutePath : path.resolve(path.dirname(editor.getPath()),schemaPath);
    fs.writeFileSync(shFile,content)
}

export function createGlobalSchemaFromNameAndContent10(root:hl.IHighLevelNode,name:string,
                                                       schemaPath:string,content:string,
                                                       editor: sharedCalc.IAbstractTextEditor, absolutePath?: string){
    var t:def.NodeClass=<def.NodeClass>root.definition().universe().type(universes.Universe10.TypeDeclaration.name);
    var sc=stubs.createStubNode(t,
        (<any>t.universe().type(universes.Universe10.Api.name)).property(universes.Universe10.Api.properties.types.name),
        ""+name);

    sc.attrOrCreate(universes.Universe10.TypeDeclaration.properties.type.name).setValue("!include "+schemaPath)

    root.add(sc);

    createSchemaFile(content, schemaPath, editor, absolutePath);
}

export function createGlobalSchemaFromNameAndContent08(root:hl.IHighLevelNode,name:string,schp:string,content:string,
                                                       editor: sharedCalc.IAbstractTextEditor, absolutePath?: string){
    var t:def.NodeClass=<def.NodeClass>root.definition().universe().type(universes.Universe08.GlobalSchema.name);
    var sc=stubs.createStubNode(t,
        (<any>t.universe().type(universes.Universe08.Api.name)).property(universes.Universe08.Api.properties.schemas.name),
        ""+name);

    sc.attrOrCreate(universes.Universe08.GlobalSchema.properties.value.name).setValue("!include "+schp)

    root.add(sc);

    createSchemaFile(content, schp, editor, absolutePath);
}

export function cleanEmptyLines(text:string):string{
    var lines=splitOnLines(text);
    var rs:string[]=[]
    for (var i=0;i<lines.length;i++){
        if (lines[i].trim().length>0){
            rs.push(lines[i]);
        }
    }
    return rs.join("");
}