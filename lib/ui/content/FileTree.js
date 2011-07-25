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

    /**
     * initializes file tree as content
     * args: {
     *   id: string file tree id
     * @param args
     */
    constructor: function(args) {
        args = args || {};
        this.fileTreeId = args.id;
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
            file: air.File.applicationDirectory,
            //path: "C:/AirTest/",
            placeAt: this.htmlId,
            id: this.fileTreeId
        });

        this.fileTree.create();
    },

    setSize: function(width, height) {
        this.inherited(arguments);
        this.fileTree.setSize(width, height);
    }
});
