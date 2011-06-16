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
    source: null,

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
        this.createEditor();

        /*
        this.subscribe({
            event: "FileOpen",
            method: this.openFile
        }); */


/*
        this.subscribe({
            event: "RefreshWindow",
            method: function() {
                this.editor.resize

                //get source code
                dojo.xhrGet({
                    url: "bsp.java",
                    handleAs: "text",
                    load: dojo.hitch(this, function(java) {
                        this.setContent(java);
                    }),
                    error: function(error) {
                        console.debug("editor: " + error);
                    }
                });
            }
        });*/
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
    },

    /**
     * gets the current set source code
     */
    getSource: function() {
        return this.editor.getSession().getValue();
    },

    /**
     * sets new source code
     * @param src string source code
     */
    setSource: function(src) {
        this.source = src || this.source || "";
        this.editor.getSession().setValue(this.source);
        this.editor.gotoLine(2);
        this.editor.gotoLine(1);
    },

    /**
     * sets the size of the font
     * @param size integer font size in px
     */
    setFontSize: function(size) {
        dojo.style(this.editorId, "fontSize", size + "px");
    },

    /**
     * replaces source code
     * @param find string
     * @param replace string
     */
    replaceSource: function(find, replace) {
        this.editor.find(find);
        this.editor.replace(replace);
    },

    /**
     * opens a java file
     * @param file
     */
    openFile: function(file) {
        //air.trace(file.path);
        //get source code
        dojo.xhrGet({
            url: file.path,
            handleAs: "text",
            load: dojo.hitch(this, function(src) {
                this.setSource(src);
            }),
            error: function(error) {
                //TODO log and show error
                //air.trace("can't open file " + file.name + " - error: " + error);
            }
        });
    },

    /**
     * destroys this editor
     * @param del
     */
    destroy: function(del) {
        if(this.editor) this.editor.destroy();
        this.inherited(arguments);
    },

    /**
     * activates editor
     */
    activate: function() {
        this.inherited(arguments);
        this.createEditor();
    },

    /**
     * deactivates editor
     */
    deactivate: function() {
        if(this.editor) this.editor.destroy();
        this.inherited(arguments);
    },

    /**
     * creates a new editor
     */
    createEditor: function() {
        //destroy editor if already exists
        if(this.editor) {
            this.editor.destroy();
            this.editor = null;
        }

        //initialize and create ace editor
        this.editor = ace.edit(this.editorId);

        //set color theme
        this.editor.setTheme("ace/theme/eclipse");

        //get java mode
        this.javaMode = require("ace/mode/java").Mode;

        //set java mode
        this.editor.getSession().setMode(new this.javaMode());
        this.editor.getSession().setUseSoftTabs(true);

        //set old source code if already exists
        this.setSource();
    }
});

