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

    /**
     * create unique id and
     * places the file tree into DOM
     */
    create: function() {
        //create content container
        this.inherited(arguments);
        
        //TODO load project folder
        this.fileTree = new ui.FileTree({
            path: "C:/AirTest/",
            placeAt: this.htmlId
        });

        this.fileTree.create();
    }
});
