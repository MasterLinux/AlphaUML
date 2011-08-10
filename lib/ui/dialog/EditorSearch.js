/**
 * User: Christoph Grundmann
 * Date: 10.08.11
 * Time: 00:36
 *
 */
dojo.provide("ui.dialog.EditorSearch");
dojo.require("ui.TextInput");
dojo.require("ui.Language");
dojo.require("ui.Dialog");

dojo.declare("ui.dialog.EditorSearch", ui.Dialog, {
    language: null,
    editor: null,
    searchId: null,
    searchBtnId: null,
    searchInput: null,
    replaceId: null,
    replaceBtnId: null,
    replaceInput: null,

    constructor: function(args) {
        args = args || {};
        this.editor = args.editor;
        this.language = new ui.Language();
    },

    /**
     * creates and places the dialog
     */
    create: function() {
        this.inherited(arguments);

        this.hideOkButton();

        //create ids
        this.searchId = this.htmlId + "Search";
        this.searchBtnId = this.htmlId + "SearchButton";
        this.replaceId = this.htmlId + "Replace";
        this.replaceBtnId = this.htmlId + "ReplaceButton";

        //show forward engineering button
        this.addContent("Search",
            '<div class="contentInput" id="' + this.searchId + '"></div>' +
            '<div class="execButton left clear" id="' + this.searchBtnId + '">' + this.language.SEARCH_BUTTON + '</div>'
        );

        //show forward engineering button
        this.addContent("Replace with",
            '<div class="contentInput" id="' + this.replaceId + '"></div>' +
            '<div class="execButton left clear" id="' + this.replaceBtnId + '">' + this.language.REPLACE_BUTTON + '</div>'
        );

        //create modifier input field
        this.searchInput = new ui.TextInput({
            placeAt: this.searchId,
            minSize: 15,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = "";
                return value;
            }
        });

        this.searchInput.create();

        //create modifier input field
        this.replaceInput = new ui.TextInput({
            placeAt: this.replaceId,
            minSize: 15,
            valueFilter: function(value) {
                //on empty string return null
                if(value === "") value = "";
                return value;
            }
        });

        this.replaceInput.create();

        this.connect({
            event: "onclick",
            nodeId: this.searchBtnId,
            name: "SearchBTN",
            method: function() {
                this.search();
            }
        });

        this.connect({
            event: "onclick",
            nodeId: this.replaceBtnId,
            name: "ReplaceBTN",
            method: function() {
                this.replace();
            }
        });
    },

    search: function() {
        try {
            this.editor.editor.find(this.searchInput.getValue(),{
              backwards: false,
              wrap: false,
              caseSensitive: false,
              wholeWord: false,
              regExp: false
            });
            this.editor.editor.findNext();
            this.editor.editor.findPrevious();
        } catch(error) {
            var console = this.getGlobal("console", null, "master");
            if(console) {
                console.addMessage("searching: " + error, true, "error");
            }
        }
    },

    replace: function() {
        try {
            this.editor.editor.find(this.searchInput.getValue());
            this.editor.editor.findNext();
            this.editor.editor.replace(this.replaceInput.getValue());
        } catch(error) {
            var console = this.getGlobal("console", null, "master");
            if(console) {
                console.addMessage("replacing: " + error, true, "error");
            }
        }
    },

    /**
     * destroys the dialog
     * @param del boolean
     */
    destroy: function(del) {
        if(this.searchInput) this.searchInput.destroy(true);
        if(this.replaceInput) this.replaceInput.destroy(true);
        this.inherited(arguments);
    }
});
