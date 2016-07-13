# raml-actions

[![Build Status](https://travis-ci.org/mulesoft/raml-actions.svg?branch=code)](https://travis-ci.org/mulesoft/raml-actions)

This is a central place for RAML context-dependent actions.

## Getting Started
```typescript
import actions = require("raml-actions")

var editorProvider = {
       getCurrentEditor() {
           ...
           return editor
       }
}
actions.setEditorProvider(editorProvider)

actions.intializeStandardActions()

...

// availableActions now contain the list of all actions,
// available and executable for the current selection
var availableActions = actions.calculateCurrentActions(actions.TARGET_RAML_EDITOR_NODE)

availableActions[0].onClick()
```

## Code highlights

### Actions core
`addAction` method contributes new action to the system.

`IContextDependedAction` - this is the main interface for context-dependent action. Besides `name`, `label`, `target` and `category` properties, each context-dependent action should provide the following:
* `stateCalculator`, which is responsible for calculating the current context state for the action.
* `shouldDisplay` visibility filter, which decides whether the action is available in the calculated context state.
* `onClick` method, which recieves calculated context state as an argument and should perform the actual action execution

`calculateCurrentActions` method calculates actions, which are available in the current context. Calculated actions differ from the ones contributed to the system via `addAction` as besides meta-information like `name`, `label` etc they do only contain a single method `onClick` taking no arguments, everything else regarding context state calculation, checks, and arguments passing is performed by the system.

### Shared state calculation
Extending `CommonASTStateCalculator` in action's state calculator allows reusing the shared state, being calculated once for all actions, this reduces calculation time. Subclasses then should use the shared state containing general data like currently selected AST node to calculate state more specific for the action.

It is mandatory to set editor provider to the system by calling `setEditorProvider` method so that the system can be calculating the shared state.

It is also recommended to provide the system with more refined AST provider by calling `setASTProvider`, otherwise the system will build AST and find currently selected node using editor's text and cursor position.

Calling `setASTModifier` will provide actions with ability to modify AST.

### UI actions
`IContextDependedAction` is an interface for actions with no information required from user besides the current context.

If action requires additional input, `IContextDependedUIAction` should be used instead.
* `initialUIStateConvertor` converts context state to the initial UI state (which should be serializable for client-server scenario), which will be the input data for UI.
* `displayUI` is a method, which will be called by the system; the method is responsible for displaying UI basing on the initial UI state, and should call back when finished providing the final UI state (the state containing user input). This state object should also be serializable for client-server scenario.

In case of UI actions, `onClick` method of the action recieves both context state and final UI state as arguments.

### Context menu
`registerContributor` method allows registering context menu contributors, which can provide existing menu items.

`calculateMenuItemsTree` method calculates context menu tree for the current context.

One of the standard context menu contributors is the one using context actions for form the context menu.
