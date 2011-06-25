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
    isInit: null,

    //settings
    fontSize: null,
    invChar: null,

    //file info
    filePath: null,
    fileName: null,
    fileType: null,
    hasChanged: null,

    /**
     * initializes editor
     * @param args
     */
    constructor: function(args) {
        this.fontSize = 12;
        this.invChar = false;
    },

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
        this.fontSize = size || this.fontSize || 12;
        dojo.style(this.editorId, "fontSize", this.fontSize + "px");
    },

    /**
     * increments the font size
     * @param step integer increment step
     */
    incFontSize: function(step) {
        step = step || 1;
        this.setFontSize(this.fontSize + step);
    },

    /**
     * decrement the font size
     * @param step integer decrement step
     */
    decFontSize: function(step) {
        step = step || 1;
        this.setFontSize(this.fontSize - step);
    },

    /**
     * shows or hides invisible chars
     */
    showInvisibles: function() {
        this.invChar = !this.invChar;
        this.editor.setShowInvisibles(this.invChar);
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
        //store file info
        this.filePath = file.path;
        this.fileName = file.name;
        this.fileType = file.type;

        //get source code
        dojo.xhrGet({
            url: file.path,
            handleAs: "text",
            load: dojo.hitch(this, function(src) {
                //set received source
                this.setSource(src);
                //initialize editor
                this.setEditorEvents();
            }),
            error: function(error) {
                //TODO log and show error
                //air.trace("can't open file " + file.name + " - error: " + error);
            }
        });


    },

    /**
     * saves the currently open file
     */
    saveFile: function() {
        //save if necessary
        if(this.hasChanged && this.filePath) {
            //get currently open file
            var file = new air.File(this.filePath);
            file = new air.File(file.nativePath);

            //create a new file stream
            var fileStream = new air.FileStream();

            //open a new file stream
            fileStream.open(file, air.FileMode.WRITE);

            //write new source into stream
            fileStream.writeUTFBytes(this.getSource());

            //set event handler for save complete events
            //fileStream.addEventListener(air.Event.CLOSE, dojo.hitch(this, function(event) {

            //}));

            //close file
            fileStream.close();

            //unset change state
            this.hasChanged = false;

            //reset tab title
            this.tab.setTitle(this.tab.title, false);
        }
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

        //reset editor events
        if(this.isInit) {
            this.setEditorEvents();
        }
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

        //set default font size
        this.setFontSize();

        //set old source code if already exists
        this.setSource();

        //reset tab title
        if(this.hasChanged) {
            this.tab.setTitle(this.tab.title + "*", false);
        }
    },

    /**
     * sets each necessary event handler
     */
    setEditorEvents: function() {
        this.isInit = true;
        
        //register event handler for file changing
        this.editor.getSession().on('change', dojo.hitch(this, function(event) {
            //air.Introspector.Console.log(event);
            if(air) air.trace("change - init: " + this.fileInit);
            if(!this.fileInit) {
                this.hasChanged = true;
                this.tab.setTitle(this.tab.title + "*", false);
            }
        }));
    },

    /**
     * sets each necessary info about
     * the current opened file
     *
     * args: {
     *   name: "file name",
     *   path: "file path",
     *   type: "data type"
     * }
     *
     * @param args object file info
     */
    setFileInfo: function(args) {
        this.filePath = args.path;
        this.fileName = args.name;
        this.fileType = args.type;
    },

    /**
     * gets the file name, file path and
     * the data type of the current
     * opened file
     *
     * return {
     *   name: "file name",
     *   path: "file path",
     *   type: "data type"
     * }
     * @return object file info
     */
    getFileInfo: function() {
        return {
            name: this.fileName,
            path: this.filePath,
            type: this.fileType
        }
    }
});

