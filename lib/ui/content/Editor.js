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
    editorId: null,
    javaMode: null,

    create: function() {
        //create content container
        this.inherited(arguments);

        //create editor id
        this.editorId = this.htmlId + "Editor";

        //set code editor container
        this.setContent('<div class="Editor" id="' + this.editorId + '"></div>');

        //initialize and create ace editor
        this.editor = ace.edit(this.editorId);

        //set color theme
        this.editor.setTheme("ace/theme/eclipse");

        //get java mode
        this.javaMode = require("ace/mode/java").Mode;

        //set java mode
        this.editor.getSession().setMode(new this.javaMode());
        //this.editor.getSession().setUseSoftTabs(true);

        //dojo.connect(dojo.body(), "onclick", this, function() {
           //air.trace(typeof this.editor.getSelectionRange());
        //});

        this.editor.getSession().setValue("the new text here");

        this.subscribe({
            event: "RefreshWindow",
            method: this.editor.resize
        });
    },

    activate: function() {
        this.inherited(arguments);

        //workaround: the ace editor don't set
        //the correct size at the first init
        this.editor.resize();
    }
});

