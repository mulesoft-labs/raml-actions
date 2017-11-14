import contextActions = require("../../actionManagement/contextActions")

import fs = require ('fs')

export class DefaultExternalUIDisplay implements contextActions.IExternalUIDisplay {

    constructor(private path : string, private content?: string) {

    }

    /**
     * Creates UI JavaScript code. The code will be evaluated externally,
     * and should accept initial ui state and return final UI state, which will be transferred
     * to the action's onClick
     * @param initialUIState
     */
    createUICode(initialUIState? : any ) : string {
        return this.content || fs.readFileSync(this.path).toString();
    }
}