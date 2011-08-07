/**
 * User: Christoph Grundmann
 * Date: 24.05.11
 * Time: 15:20
 *
 */
dojo.provide("ui.content.FileTree");
dojo.require("ui.FileTree");
dojo.require("ui.Content");

dojo.declare("ui.content.FileTree", ui.Content, {
    fileTree: null,
    fileTreeId: null,
    projectPath: null,

    /**
     * initializes file tree as content
     * args: {
     *   id: string file tree id
     *   path: string project root
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.fileTreeId = args.id;
        this.projectPath = args.path;
        this.lockResizing = true;
    },

    /**
     * create unique id and
     * places the file tree into DOM
     */
    create: function() {
        //create content container
        this.inherited(arguments);
        
        //TODO load project folder
        this.fileTree = new ui.FileTree({
            //file: air.File.applicationDirectory,
            path: this.projectPath,
            placeAt: this.htmlId,
            id: this.fileTreeId
        });

        this.fileTree.create();

        var contentNode = dojo.byId(this.htmlId);
        dojo.style(contentNode.parentNode, "overflow", "auto");
        dojo.style(contentNode, "marginTop", "5px");
        dojo.style(contentNode.parentNode.parentNode, "borderRight", "1px solid #cccccc");
    },

    setSize: function(width, height) {
        this.inherited(arguments);
        //this.fileTree.setSize(width, height);
    }
});
