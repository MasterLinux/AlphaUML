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

    /**
     * create unique id and
     * places the editor into DOM
     */
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

    /**
     * handler for tab activation
     */
    activate: function() {
        this.inherited(arguments);

        //workaround: the ace editor don't set
        //the correct size at the first init
        this.editor.resize();
    },

    /**
     * sets the size of the
     * contents container
     * @param width integer
     * @param height integer
     */
    setSize: function(width, height) {
        this.inherited(arguments);

        //resize editor
        this.editor.resize();
    }
});

