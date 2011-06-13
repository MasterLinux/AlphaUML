/**
 * User: Christoph Grundmann
 * Date: 12.06.11
 * Time: 15:14
 *
 */
dojo.provide("ui.content.Console");
dojo.require("ui.Console");
dojo.require("ui.Content");

dojo.declare("ui.content.Console", ui.Content, {
    console: null,

    /**
     * create unique id and
     * places the file tree into DOM
     */
    create: function() {
        //create content container
        this.inherited(arguments);

        //TODO load project folder
        this.console = new ui.Console({
            placeAt: this.htmlId
        });

        this.console.create();
    }
});