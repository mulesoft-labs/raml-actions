import ramlOutline = require("raml-outline");
import parser=require("raml-1-parser");
import universeHelpers = parser.universeHelpers;
import hl = parser.hl;
import services = parser.ds;

export function newNode(parent: hl.IHighLevelNode, title: string, property: string, key: string = "key"): any {
    if(parent === null) {
        return {
            isParentNull: true
        };
    }
    
    if(property === "body") {
        key = "application/json";
    }
    
    var stub = parser.stubs.createStub(parent, property,key);

    parser.utils.updateType(stub);
    
    var root = ramlOutline.buildDetailsItem(stub);
    
    var initialState = {
        detailsTree: root.toJSON(),
        isParentNull: false,
        title: title
    }
    
    return initialState;
}

export function applyChanges(parent: hl.IHighLevelNode, changes: any, title: string, property: string, key: string = "key") {
    if(parent === null) {
        return {
            isParentNull: true
        };
    }

    if(property === "body") {
        key = "application/json";
    }

    var stub = parser.stubs.createStub(parent, property,key);

    parser.utils.updateType(stub);

    var root = ramlOutline.buildDetailsItem(stub);
    
    Object.keys(changes).forEach(itemId => {
        var item = getItemById(root, itemId);
        
        if(item) {
            (<any>item).setValue(changes[itemId]);
        }
    });
    
    
    (<any>stub)._parent=null;
    
    (<any>stub.lowLevel())._unit=null;
    
    parent.add(stub);
}

export function getMethodParent(node: hl.IHighLevelNode) {
    if (!node || !node.property()) return null;

    if ((universeHelpers.isMethodType(node.definition())||universeHelpers.isTraitType(node.definition()))&&!node.definition().getAdapter(services.RAMLService).isUserDefined()){
        return node;
    }

    return null;
}

export function getItemById(root: ramlOutline.DetailsItem, id: string) : ramlOutline.DetailsItem {
    if (root.getId() == id) {
        return root;
    }

    if (root.getChildren() == null || root.getChildren().length == 0) {
        return null;
    }

    for (const child of root.getChildren()) {

        const childResult = getItemById(child, id);

        if (childResult != null) {
            return childResult;
        }
    }

    return null;
}