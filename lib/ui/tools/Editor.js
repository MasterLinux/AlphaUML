/**
 * User: Christoph Grundmann
 * Date: 16.06.11
 * Time: 15:12
 *
 * menu for the editor
 */
dojo.provide("ui.tools.Editor");
dojo.require("ui.Tools");

dojo.declare("ui.tools.Editor", ui.Tools, {
    /**
     * creates the editors context menu
     */
    create: function(placeAt) {
        //declare buttons
        this.buttons = [
            {
                title: "test",
                onClick: function() {
                    air.trace("click me, 3!");
                }
            }
        ];

        //create menu
        this.inherited(arguments);
    }
});
