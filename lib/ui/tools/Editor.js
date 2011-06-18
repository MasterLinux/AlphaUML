/**
 * User: Christoph Grundmann
 * Date: 16.06.11
 * Time: 15:12
 *
 * menu for the editor
 */
dojo.provide("ui.tools.Editor");
dojo.require("ui.Tools");

dojo.declare("ui.tools.Editor", ui.Tools, {
    /**
     * creates the editors context menu
     */
    create: function(placeAt) {
        var save = this.createSaveBtn();
        var search = this.createSearchBtn();
        var incFS = this.createFontSizeIncBtn();
        var decFS = this.createFontSizeDecBtn();
        
        //declare buttons
        this.buttons = [save, search, incFS, decFS];

        //create menu
        this.inherited(arguments);
    },

    /**
     * creates a button for open the search
     */
    createSearchBtn: function() {
        var editor = this.tab.content;
        return {
            title: "Search / Replace",
            icon: "search",
            onClick: dojo.hitch(this, function() {
                //editor.showInvisibles();
                //air.Introspector.Console.log(editor.editor);
            })
        }
    },

    /**
     * creates a button for incrementing the font size
     */
    createFontSizeIncBtn: function() {
        var editor = this.tab.content;
        return {
            title: "Increment Font Size",
            icon: "fontSizeInc",
            onClick: dojo.hitch(this, function() {
                editor.incFontSize();
            })
        }
    },

    /**
     * creates a button for incrementing the font size
     */
    createFontSizeDecBtn: function() {
        var editor = this.tab.content;
        return {
            title: "Decrement Font Size",
            icon: "fontSizeDec",
            onClick: dojo.hitch(this, function() {
                editor.decFontSize();
            })
        }
    },

    createSaveBtn: function() {
        var editor = this.tab.content;
        return {
            title: "Save File",
            icon: "save",
            onClick: dojo.hitch(this, function() {
                editor.saveFile();
            })
        }
    }
});
