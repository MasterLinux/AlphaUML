/**
 * User: Christoph Grundmann
 * Date: 02.08.11
 * Time: 17:54
 *
 */
dojo.provide("ui.tools.Console");
dojo.require("ui.Tools");

dojo.declare("ui.tools.Console", ui.Tools, {
    /**
     * creates the context menu for consoles
     */
    create: function(placeAt) {
        var cmdInput = this.createCmdInput();

        //declare buttons
        this.inputs = [
            cmdInput
        ];

        //create menu
        this.inherited(arguments);
    },

    /**
     * creates a button for adding a new class
     */
    createCmdInput: function() {
        var console = this.tab.content.console;
        return {
            onApprove: dojo.hitch(this, function(value, event) {
                //execute command
                console.executeCmd(value);
            })
        }
    }
});
