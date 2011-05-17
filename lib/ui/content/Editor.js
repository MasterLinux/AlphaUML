/**
 * User: Christoph Grundmann
 * Date: 16.05.11
 * Time: 15:37
 * TODO: update Editor class
 */
dojo.provide("ui.content.Editor");
dojo.require("ui.Content");

dojo.declare("ui.content.Editor", ui.Content, {
    editor: null,
    javaMode: null,

    constructor: function(args) {
        //set code editor container TODO integrate this.htmlId
        this.content = '<pre id="codeEditor"></pre>';
    },

    create: function() {
        //create content container
        this.inherited(arguments);

        //initialize and create ace editor
        this.editor = ace.edit("codeEditor");

        //set color theme
        this.editor.setTheme("ace/theme/eclipse");

        //get java mode
        this.javaMode = require("ace/mode/java").Mode;

        //set java mode
        this.editor.getSession().setMode(new this.javaMode());
        this.editor.getSession().setUseSoftTabs(true);

        dojo.connect(dojo.body(), "onclick", this, function() {
           air.trace(typeof this.editor.getSelectionRange());
        });
    }
});

