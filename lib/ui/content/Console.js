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
    consoleId: null,
    console: null,

    /**
     * initialize console content
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.consoleId = args.id;
    },

    /**
     * create unique id and
     * places the file tree into DOM
     */
    create: function() {
        //create content container
        this.inherited(arguments);

        //create a new console
        this.createConsole();
    },

    /**
     * sets the size of console
     * @param width integer
     * @param height integer
     */
    setSize: function(width, height) {
        this.inherited(arguments);
        if(this.console) {
            this.console.setSize(
                this.width, 
                this.height
            );
        }
    },

    /**
     * activates editor
     */
    activate: function() {
        if(this.console) this.console.activate();
        this.inherited(arguments);
    },

    /**
     * deactivates editor
     */
    deactivate: function() {
        if(this.console) this.console.deactivate();
        this.inherited(arguments);
    },

    /**
     * creates a new console
     */
    createConsole: function() {
        //TODO load project folder
        this.console = new ui.Console({
            placeAt: this.htmlId,
            id: this.consoleId
        });

        this.console.create();
    }
});