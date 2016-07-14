/// <reference path="../../typings/main.d.ts" />

import _ = require("underscore")

import contextMenu = require("./contextMenu")
import contextActions = require("./contextActions")
import contextActionsImpl = require("./contextActionsImpl")

var contributors: { [s: string]: contextMenu.IContextMenuContributor; } = {};

/**
 * Adds new contributor to the list. All contributors are asked for the menu items
 * before the menu is displayed.
 * @param contributor
 */
export function registerContributor(contributor : contextMenu.IContextMenuContributor) {
    contributors[contributor.id] = contributor;
}

/**
 * Generally it is recommended to use contributor-based architecture instead.
 * This method allows adding a single menu item manually, if needed.
 * @param name
 * @param onClick
 * @param categories
 * @param shouldDisplay
 */
export function addMenuItem(name : string,
                            onClick: (item? : contextMenu.IContextMenuItem)=>void,
                            categories? : string[], shouldDisplay? : ()=>boolean) {

}

/**
 * Generally it is recommended to use contributor-based architecture instead.
 * Deletes all menu items with a given selector. Should almost never be called.
 * Can not delete contributor-based menu items.
 * @param selector
 */
export function deleteMenuItems(selector : string) {
    //TODO implement
}

/**
 * Generally it is recommended to use contributor-based architecture instead.
 * Deletes menu item by its selector, name, and optionally categories.
 * Can not delete contributor-based menu items.
 * @param selector
 * @param name
 * @param categories
 */
export function deleteMenuItem(selector : string, name : string, categories? : string[]) {
    //TODO implement
}

class ContextMenuItemNode implements contextMenu.IContextMenuItem {

    selector : string

    name : string

    categories : string[]

    onClick: (item? : contextMenu.IContextMenuItem)=>void

    children : ContextMenuItemNode[]

    constructor(menuItem : contextMenu.IContextMenuItem, nameOverride? : string) {
        this.selector = menuItem.selector

        if (nameOverride){
            this.name = nameOverride
        } else {
            this.name = menuItem.name
        }

        this.categories = menuItem.categories
        this.onClick = menuItem.onClick

        this.children = []
    }
}

/**
 * Calculates current menu items tree.
 * @returns {IContextMenuItemNode[]}
 */
export function calculateMenuItemsTree() : contextMenu.IContextMenuItem[] {
    var result : ContextMenuItemNode[] = [];

    for (var contributorId in contributors) {

        var contributor = contributors[contributorId];
        if (contributor.calculationStarted) {
            contributor.calculationStarted();
        }
    }

    for (var contributorId in contributors) {

        var contributor : contextMenu.IContextMenuContributor = contributors[contributorId];
        contributor.calculateItems().forEach(item => {
            addItemsTreeNode(result, item)
        });
    }

    for (var contributorId in contributors) {

        var contributor = contributors[contributorId];
        if (contributor.calculationFinished) {
            contributor.calculationFinished();
        }
    }

    return result;
}

function addItemsTreeNode(roots : ContextMenuItemNode[], item : contextMenu.IContextMenuItem) {

    var currentList = roots;
    if (item.categories) {
        for (var catIndex in item.categories) {
            var currentSegment = item.categories[catIndex]
            var existingNode = _.find(currentList, node => {
                return node.name == currentSegment
            })

            if (!existingNode) {
                existingNode = new ContextMenuItemNode(item, currentSegment);
                currentList.push(existingNode)
            }

            if (!existingNode.children) {
                currentList = [];
                existingNode.children = currentList
            } else {
                currentList = existingNode.children
            }
        }
    }

    var leafNode = _.find(currentList, node => {
        return node.name == item.name
    })

    if (leafNode) {
        var index = currentList.indexOf(leafNode, 0);
        if (index != undefined) {
            currentList.splice(index, 1);
        }
    }

    leafNode = new ContextMenuItemNode(item)

    currentList.push(leafNode)
}

var actionBasedMenuInitialized = false;

/**
 * Initializes and registers standard context menu contributor, based on currently available context actions.
 * @param selector - CSS selector, can be null if not used in the display.
 */
export function initializeActionBasedMenu(selector? : string) {
    var editorContextMenuContributor : contextMenu.IContextMenuContributor = {

        id : "editorContextActionContributor",


        calculateItems : function () {
            var currentActions = contextActionsImpl.calculateCurrentActions(
                contextActions.TARGET_RAML_EDITOR_NODE)

            if (!currentActions) return []

            var result : contextMenu.IContextMenuItem[] = []

            currentActions.forEach(action => {
                result.push({

                    selector : selector,

                    name : action.label ? action.label : action.name,

                    categories : action.category,

                    onClick: action.onClick,

                    children: []
                })
            })

            return result
        }

    }

    registerContributor(editorContextMenuContributor)
    actionBasedMenuInitialized = true;
}